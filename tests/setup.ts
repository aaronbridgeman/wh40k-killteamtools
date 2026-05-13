import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

const ensureLocalStorageApi = () => {
	if (typeof window === 'undefined') return;

	const storage = window.localStorage as Partial<Storage> | undefined;

	if (
		storage &&
		typeof storage.getItem === 'function' &&
		typeof storage.setItem === 'function' &&
		typeof storage.removeItem === 'function' &&
		typeof storage.clear === 'function'
	) {
		return;
	}

	const backing = new Map<string, string>();

	const fallbackStorage: Storage = {
		get length() {
			return backing.size;
		},
		clear() {
			backing.clear();
		},
		getItem(key: string) {
			return backing.has(key) ? backing.get(key)! : null;
		},
		key(index: number) {
			return Array.from(backing.keys())[index] ?? null;
		},
		removeItem(key: string) {
			backing.delete(key);
		},
		setItem(key: string, value: string) {
			backing.set(key, String(value));
		},
	};

	Object.defineProperty(window, 'localStorage', {
		configurable: true,
		value: fallbackStorage,
	});
};

beforeEach(() => {
	ensureLocalStorageApi();
});
