import streamlit as st
import cv2
import numpy as np
import pandas as pd
import time
import os
import random
from scipy.stats import chisquare
import plotly.express as px
import plotly.graph_objects as go

# --- CONFIGURATION & CONSTANTS ---
LOG_FILE = "dice_log.csv"

# Initialize Session State Variables if they do not exist
if "roll_data" not in st.session_state:
    if os.path.exists(LOG_FILE):
        st.session_state.roll_data = pd.read_csv(LOG_FILE)
    else:
        st.session_state.roll_data = pd.DataFrame(columns=["Timestamp", "Roll_ID", "Dice_Count", "Values_List", "Sum"])

if "app_state" not in st.session_state:
    st.session_state.app_state = "IDLE"  # IDLE, ROLLING, SETTLING, READ

if "settle_start_time" not in st.session_state:
    st.session_state.settle_start_time = 0

if "last_frame_gray" not in st.session_state:
    st.session_state.last_frame_gray = None

if "simulate_roll_counter" not in st.session_state:
    st.session_state.simulate_roll_counter = 0

# --- MODULE 1: VISION PROCESSOR ---
class VisionProcessor:
    @staticmethod
    def preprocess_image(frame, blur_ksize=5, block_size=11, c_val=2):
        """Converts frame to gray, applies blur and adaptive thresholding."""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (blur_ksize, blur_ksize), 0)
        # Using adaptive thresholding to deal with lighting variations
        thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY_INV, block_size, c_val
        )
        return gray, thresh

    @staticmethod
    def count_pips_in_die(die_roi, min_area=5, max_area=150, min_circularity=0.75):
        """Finds circular pip contours within a cropped single die region."""
        contours, _ = cv2.findContours(die_roi, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        pip_count = 0
        
        for c in contours:
            area = cv2.contourArea(c)
            perimeter = cv2.arcLength(c, True)
            
            if min_area < area < max_area and perimeter > 0:
                circularity = 4 * np.pi * area / (perimeter * perimeter)
                if circularity >= min_circularity:
                    pip_count += 1
        return pip_count

    @classmethod
    def process_dice_frame(cls, frame, thresh, min_die_area=500, max_die_area=5000):
        """Detects individual dice boundaries and calculates their pip values."""
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        detected_dice = []
        annotated_frame = frame.copy()
        
        for c in contours:
            area = cv2.contourArea(c)
            if min_die_area < area < max_die_area:
                x, y, w, h = cv2.boundingRect(c)
                
                # Dynamic aspect ratio validation for six sided dice squares
                aspect_ratio = float(w) / h
                if 0.8 <= aspect_ratio <= 1.25:
                    die_thresh_roi = thresh[y:y+h, x:x+w]
                    pips = cls.count_pips_in_die(die_thresh_roi)
                    
                    # Log if code falls within valid D6 rules
                    if 1 <= pips <= 6:
                        detected_dice.append(pips)
                        cv2.rectangle(annotated_frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                        cv2.putText(annotated_frame, f"D6: {pips}", (x, y-10), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                    else:
                        # Fallback flag for impossible counts (glare / clipping)
                        cv2.rectangle(annotated_frame, (x, y), (x+w, y+h), (0, 0, 255), 1)
                        cv2.putText(annotated_frame, "Uncertain", (x, y-10), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
                                    
        return annotated_frame, detected_dice

# --- MODULE 2: STATE MACHINE & ROLL TRACKER ---
class RollTracker:
    @staticmethod
    def detect_motion(current_gray, roi_coords, motion_threshold=20):
        """Compares past frame variance inside the ROI to find frame changes."""
        x, y, w, h = roi_coords
        crop_curr = current_gray[y:y+h, x:x+w]
        
        if st.session_state.last_frame_gray is None:
            st.session_state.last_frame_gray = crop_curr
            return 0
            
        crop_prev = st.session_state.last_frame_gray
        # Adjust size matrix matches if window was shifted mid-stream
        if crop_curr.shape != crop_prev.shape:
            st.session_state.last_frame_gray = crop_curr
            return 0
            
        frame_diff = cv2.absdiff(crop_curr, crop_prev)
        _, diff_thresh = cv2.threshold(frame_diff, 25, 255, cv2.THRESH_BINARY)
        motion_score = np.sum(diff_thresh) / 255
        
        st.session_state.last_frame_gray = crop_curr
        return motion_score

# --- MODULE 3: STATS & ANALYTICS ENGINE ---
class StatsEngine:
    @staticmethod
    def log_roll(values):
        """Appends verified numbers to standard flat file repository."""
        if not values:
            return
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        roll_id = len(st.session_state.roll_data) + 1
        new_row = pd.DataFrame([{
            "Timestamp": timestamp,
            "Roll_ID": roll_id,
            "Dice_Count": len(values),
            "Values_List": str(values),
            "Sum": sum(values)
        }])
        st.session_state.roll_data = pd.concat([st.session_state.roll_data, new_row], ignore_index=True)
        st.session_state.roll_data.to_csv(LOG_FILE, index=False)

    @staticmethod
    def calculate_statistics(df):
        """Generates descriptive metrics, group splits and Chi-Square models."""
        # Unpack absolute text/string list representation safely
        all_faces = []
        for val_str in df["Values_List"].astype(str):
            try:
                vals = eval(val_str)
                all_faces.extend(vals)
            except:
                continue
                
        total_die_rolls = len(all_faces)
        if total_die_rolls == 0:
            return None
            
        counts = pd.Series(all_faces).value_counts().reindex(range(1, 7), fill_value=0)
        percentages = (counts / total_die_rolls) * 100
        
        # Calculate Groupings
        low_count = counts.loc[1:3].sum()
        high_count = counts.loc[4:6].sum()
        even_count = counts.loc[[2, 4, 6]].sum()
        odd_count = counts.loc[[1, 3, 5]].sum()
        
        # Chi-Square Test
        expected_frequencies = [total_die_rolls / 6.0] * 6
        chi_stat, p_val = chisquare(list(counts.values), f_exp=expected_frequencies)
        
        # Running Cumulative Average
        running_avg = pd.Series(all_faces).expanding().mean().tolist()
        
        return {
            "total_rolls": total_die_rolls,
            "counts": counts,
            "percentages": percentages,
            "low_pct": (low_count / total_die_rolls) * 100,
            "high_pct": (high_count / total_die_rolls) * 100,
            "even_pct": (even_count / total_die_rolls) * 100,
            "odd_pct": (odd_count / total_die_rolls) * 100,
            "pair_12": (counts.loc[1:2].sum() / total_die_rolls) * 100,
            "pair_34": (counts.loc[3:4].sum() / total_die_rolls) * 100,
            "pair_56": (counts.loc[5:6].sum() / total_die_rolls) * 100,
            "chi_stat": chi_stat,
            "p_value": p_val,
            "running_avg": running_avg
        }

# --- MODULE 4: STREAMLIT APP ENGINE USER INTERFACE ---
def main():
    st.set_page_config(layout="wide", page_title="Automated Dice Tracker")
    st.title("🎲 Real-Time Web-Cam Dice Tracker & Analytics")
    st.markdown("Automated Computer Vision framework for identifying dice patterns and assessing mathematical fairness parameters.")

    # Sidebar Controls
    st.sidebar.header("🔧 Calibration & Settings")
    input_source = st.sidebar.selectbox("Video Source", ["Simulated (No Web-Cam)", "Webcam Index 0"])
    settle_delay = st.sidebar.slider("Settle Validation Window (seconds)", 0.5, 3.0, 1.2, step=0.1)
    motion_sens = st.sidebar.slider("Motion Threshold Sensitivity", 5, 100, 30)
    
    if st.sidebar.button("🔴 Clear All Data logs"):
        if os.path.exists(LOG_FILE):
            os.remove(LOG_FILE)
        st.session_state.roll_data = pd.DataFrame(columns=["Timestamp", "Roll_ID", "Dice_Count", "Values_List", "Sum"])
        st.session_state.app_state = "IDLE"
        st.experimental_rerun()

    # Layout Setup
    col1, col2 = st.columns([1, 1])

    with col1:
        st.subheader("📹 Capture Stream")
        image_placeholder = st.empty()
        status_placeholder = st.empty()

    # Setup Simulated vs Capture logic frameworks
    if input_source == "Webcam Index 0":
        cap = cv2.VideoCapture(0)
    else:
        cap = None

    # App Runtime Simulation Loop
    run_tracking = st.checkbox("Run Tracking Engine", value=True)
    
    # Process Metrics Data
    stats = StatsEngine.calculate_statistics(st.session_state.roll_data)

    with col2:
        st.subheader("📊 Analytics Dashboard")
        if stats:
            m1, m2, m3 = st.columns(3)
            m1.metric("Total Dice Recorded", f"{stats['total_rolls']}")
            m2.metric("Most Frequent Face", f"{stats['counts'].idxmax()} (x{stats['counts'].max()})")
            
            # Highlight unfair variances via calculated critical value triggers
            p_status = "Fair (Uniform)" if stats['p_value'] >= 0.05 else "Biased / Unfair"
            m3.metric("Chi2 Test Status", p_status, delta=f"p={stats['p_value']:.4f}", delta_color="normal" if stats['p_value'] >= 0.05 else "inverse")
            
            # Distribution Charts Group
            fig_hist = px.bar(
                x=list(range(1, 7)), y=stats['percentages'],
                labels={'x': 'Dice Face Value', 'y': 'Observed Frequency (%)'},
                title="Face Probability Distribution (Target: 16.67%)",
                range_y=[0, max(stats['percentages'].max() + 5, 25)]
            )
            fig_hist.add_hline(y=16.67, line_dash="dash", line_color="red", annotation_text="Theoretical Expected")
            st.plotly_chart(fig_hist, use_container_width=True)
        else:
            st.info("Awaiting structural dice tracking input to generate chart models...")

    # Main Core Loop logic running on Streamlit frame refreshes
    if run_tracking:
        # Generate dummy or read video hardware frames
        if cap and cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                st.error("Hardware streaming error encountered on index 0.")
                run_tracking = False
        else:
            # Generate local synthetic array block simulation for fallback testing
            frame = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.rectangle(frame, (80, 80), (560, 400), (40, 40, 40), -1) # Tray Boundary Box
            cv2.putText(frame, f"Simulation View [State: {st.session_state.app_state}]", (100, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

            # Inject artificial programmatic noise matrices to simulate moving elements
            if st.session_state.app_state == "ROLLING":
                for _ in range(3):
                    cv2.circle(frame, (random.randint(150, 450), random.randint(120, 360)), 25, (180, 180, 180), -1)
            else:
                # Mock constant stationary D6 coordinates
                cv2.rectangle(frame, (200, 200), (250, 250), (240, 240, 240), -1)
                cv2.circle(frame, (215, 215), 3, (0, 0, 0), -1)
                cv2.circle(frame, (235, 235), 3, (0, 0, 0), -1) # Represents a '2'
                
                cv2.rectangle(frame, (320, 220), (370, 270), (240, 240, 240), -1)
                cv2.circle(frame, (345, 245), 3, (0, 0, 0), -1) # Represents a '1'

        # ROI Coordinates definition setup 
        h_f, w_f, _ = frame.shape
        roi_box = (int(w_f*0.1), int(h_f*0.1), int(w_f*0.8), int(h_f*0.8))
        
        # Execute Frame analytics pipelines
        gray, thresh = VisionProcessor.preprocess_image(frame)
        motion_metric = RollTracker.detect_motion(gray, roi_box, motion_sens)
        annotated, detected_values = VisionProcessor.process_dice_frame(frame, thresh)
        
        # Draw ROI overlay box
        cv2.rectangle(annotated, (roi_box[0], roi_box[1]), (roi_box[0]+roi_box[2], roi_box[1]+roi_box[3]), (255, 165, 0), 2)

        # STATE MACHINE PROCESSING LAYER
        if st.session_state.app_state == "IDLE":
            status_placeholder.markdown("🟢 **Status: Ready.** Awaiting next roll throw...")
            if motion_metric > motion_sens:
                st.session_state.app_state = "ROLLING"
                
        elif st.session_state.app_state == "ROLLING":
            status_placeholder.markdown("🔴 **Status: Motion Detected!** Dice tumbling...")
            if motion_metric < motion_sens:
                st.session_state.app_state = "SETTLING"
                st.session_state.settle_start_time = time.time()
                
        elif st.session_state.app_state == "SETTLING":
            status_placeholder.markdown("🟡 **Status: Settling...** Verifying frame convergence.")
            if motion_metric > motion_sens:
                st.session_state.app_state = "ROLLING"
            elif time.time() - st.session_state.settle_start_time >= settle_delay:
                st.session_state.app_state = "READ"
                
        elif st.session_state.app_state == "READ":
            status_placeholder.markdown("💾 **Status: Reading Result & Logging entry.**")
            if input_source != "Webcam Index 0":
                # Simulated fixed input results for loop longevity validation bypass
                detected_values = [random.randint(1, 6), random.randint(1, 6)]
                
            StatsEngine.log_roll(detected_values)
            st.session_state.app_state = "IDLE"
            st.experimental_rerun()

        # Update display element matrices
        image_placeholder.image(cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB), channels="RGB")
        
        # Brief frame delay thresholding window
        time.sleep(0.05)
        st.experimental_rerun()

    if cap:
        cap.release()

    # Secondary Extended Metric Presentation Table Layer
    if stats:
        st.markdown("---")
        st.subheader("📋 Advanced Probability Splits & Running Convergences")
        
        c_sub1, c_sub2 = st.columns(2)
        with c_sub1:
            split_df = pd.DataFrame({
                "Grouping Cluster": ["Low Splits (1-3)", "High Splits (4-6)", "Evens Distribution", "Odds Distribution", "Pair Blocks (1-2)", "Pair Blocks (3-4)", "Pair Blocks (5-6)"],
                "Calculated Share (%)": [stats['low_pct'], stats['high_pct'], stats['even_pct'], stats['odd_pct'], stats['pair_12'], stats['pair_34'], stats['pair_56']],
                "Mathematical Parity Value (%)": [50.0, 50.0, 50.0, 50.0, 33.33, 33.33, 33.33]
            })
            st.table(split_df)

        with c_sub2:
            fig_line = go.Figure()
            fig_line.add_trace(go.Scatter(y=stats['running_avg'], mode='lines', name='Rolling Mean Value'))
            fig_line.add_hline(y=3.5, line_dash="dash", line_color="green", annotation_text="Expected Median D6 Mean")
            fig_line.update_layout(title="Rolling Average Variance Convergence Map", xaxis_title="Total Rolling Index Counts", yaxis_title="Cumulative Mean Value")
            st.plotly_chart(fig_line, use_container_width=True)

if __name__ == "__main__":
    main()