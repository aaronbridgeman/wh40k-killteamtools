# Product & Technical Specification: Automated Web-Cam Dice Tracker

---

## 1. Project Overview & Objective
The objective of this project is to build a desktop or local web application that uses a standard webcam to automatically detect, count, and log dice rolls in a designated dice tray. The application will track rolls over a large volume (hundreds or thousands of iterations), aggregate the data in real-time, and present comprehensive statistical analytics to determine dice fairness and rolling trends.

### Core User Flow
1. User positions a webcam directly over a high-contrast dice tray.
2. User runs the application and calibrates the "Active Detection Zone" (the tray).
3. User rolls standard six-sided dice (d6) into the tray.
4. The system detects motion, waits for the dice to settle, reads the values, and plays an audio confirmation.
5. Live charts, probabilities, and statistical fairness metrics update instantly on a dashboard.

---

## 2. Technical Stack

To ensure rapid development, modular architecture, and ease of code generation by an LLM, the following stack is specified:

*   **Programming Language:** Python 3.10+
*   **Computer Vision Engine:** OpenCV (`opencv-python`)
*   **Data Processing & Analytics:** Pandas, NumPy, SciPy (for statistical testing)
*   **Frontend UI & Live Dashboard:** Streamlit (Provides a highly reactive web dashboard completely written in Python, removing the need for separate HTML/CSS/JS javascript rendering).
*   **Data Storage:** SQLite or simple CSV logging (CSV is preferred for portability and easy spreadsheet viewing).

---

## 3. Functional Requirements

### 3.1 Camera Calibration & Pre-processing (Vision Module)
*   **Live Stream Feed:** Display a live video feed from the webcam (default index `0`).
*   **Region of Interest (ROI) Selection:** Allow the user to draw a bounding box or adjust sliders to isolate the dice tray, ignoring background noise outside the tray.
*   **Image Pre-processing:** 
    *   Convert incoming frames to Grayscale.
    *   Apply Gaussian Blur to reduce high-frequency camera noise.
    *   Use Adaptive Thresholding or Otsu’s Binarization to separate dice contours from the tray background.

### 3.2 Motion Detection & Settle Trigger (Automation Module)
*   **Frame Differencing:** Calculate the absolute difference between consecutive frames within the ROI to detect movement.
*   **State Machine Logic:**
    *   **State: Idle** -> Awaiting movement.
    *   **State: Rolling** -> Frame difference is above a `Motion Threshold`. Stop analysis while dice are tumbling.
    *   **State: Settling** -> Frame difference falls below `Motion Threshold`. Start a timer (e.g., 1.2 seconds).
    *   **State: Read & Log** -> Timer expires without further motion. Capture the frame, run pip-counting logic, log the values, trigger a brief audio beep, and return to **Idle**.

### 3.3 Dice Detection & Pip Counting (Inference Module)
*   **Die Contour Detection:** Find external contours with areas matching the expected pixel size of a die.
*   **Pip Segmentation:** Within each isolated die bounding box, search for smaller, highly circular contours (representing the recessed pips).
*   **Filtering:** Filter pip contours by min/max area and circularity metric:
    $$Circularity = 4\pi \times \frac{\text{Area}}{\text{Perimeter}^2}$$
    *(A perfect circle equals 1.0; target pips should fall between 0.75 and 1.0).*
*   **Validation:** If the system counts an impossible number of pips for a single die (e.g., 0 or greater than 6), mark the roll as "Uncertain/Manual Review Needed" to prevent polluting the dataset.

### 3.4 Data Logging & Analytics (Analytics Module)
*   **Data Persistence:** Write every successful roll to a local `dice_log.csv` containing columns: `Timestamp`, `Roll_ID`, `Dice_Count`, `Values_List`, `Sum`.
*   **Statistical Metrics:**
    *   **Frequency Count:** Raw number of times each face (1-6) has appeared.
    *   **Percentage Distributions:** Actual probability vs. Theoretical probability ($16.67\%$ per face).
    *   **Custom Groupings:** Distribution percentages for groupings: Low (1-3) vs. High (4-6), Evens vs. Odds, and pairs (1-2, 3-4, 5-6).
    *   **Convergence Metric:** A rolling line graph showing the cumulative average of all rolls over time (should converge toward $3.5$).
    *   **Chi-Square ($\chi^2$) Goodness of Fit Test:** Compute the $\chi^2$ statistic and corresponding $p$-value against a uniform distribution. 
        *   *If $p < 0.05$, display a visual warning that the die is statistically likely to be unfair/weighted.*

### 3.5 User Interface (UI Module)
*   **Control Panel:** Sidebars for webcam selection, resetting the current session data, and adjusting the motion sensitivity slider.
*   **Live Stream Window:** Displays the live camera view with bounding boxes drawn around detected dice and text overlays displaying the read values.
*   **Metrics Dashboard:** Metric callout cards showing Total Rolls, Most Rolled Number, and the Chi-Square $p$-value status.
*   **Visualizations:** Plotly charts showing a histogram of dice faces and the rolling average convergence line.

---

## 4. Prompt Engineering Guide for the LLM

When you hand this off to a code-generation LLM, paste the entire block above along with the following **Execution Prompt** to get the best structured, production-ready output:

```text
Act as a Senior Python Software Engineer specializing in Computer Vision and Data Analytics. 
Using the provided functional specification, generate a clean, modular, well-commented Python application.

Architecture Directions:
1. Divide the code into logical modules or clear sections within a single runnable script:
   - VisionProcessor: Handles OpenCV video capture, thresholding, and contour/pip tracking.
   - RollTracker: State machine managing motion detection and timing out when dice settle.
   - StatsEngine: Handles pandas computations and the SciPy Chi-Square test logic.
   - AppUI: The Streamlit engine displaying widgets, live image blocks, and Plotly graphs.
2. Ensure you include fallback mock logic for the webcam capture so that if a camera isn't plugged in, the app can run using simulated frame logic for UI testing.
3. Write robust pip-counting logic using OpenCV's SimpleBlobDetector or cv2.findContours with strict circularity checking to avoid false positives from glare.
4. Output the code complete, without omitting sections or using placeholders like '# insert logic here'. Include a requirements.txt string.
```
