const DEVICE_ID_KEY = import.meta.env.DEVICE_ID_KEY || "";

export const getDeviceId = async (): Promise<string> => {
  if (typeof window === "undefined") {
    return "";
  }

  let deviceId = window.localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = window.crypto.randomUUID();

    window.localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
};
