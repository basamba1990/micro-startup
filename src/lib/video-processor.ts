// Video processing utilities

export const validateVideoFile = (file: File): boolean => {
  const validTypes = ["video/mp4", "video/webm", "video/quicktime"];
  const maxSize = 500 * 1024 * 1024; // 500MB

  if (!validTypes.includes(file.type)) {
    console.error("Invalid video type. Supported: MP4, WebM, MOV");
    return false;
  }

  if (file.size > maxSize) {
    console.error("Video file too large. Max size: 500MB");
    return false;
  }

  return true;
};

export const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    video.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(objectUrl);
      resolve(video.duration);
    });

    video.addEventListener("error", () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load video"));
    });

    video.src = objectUrl;
  });
};

export const extractVideoThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const objectUrl = URL.createObjectURL(file);

    video.addEventListener("loadedmetadata", () => {
      video.currentTime = Math.min(5, video.duration / 2);
    });

    video.addEventListener("seeked", () => {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        resolve(canvas.toDataURL("image/jpeg"));
      }
      URL.revokeObjectURL(objectUrl);
    });

    video.addEventListener("error", () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to extract thumbnail"));
    });

    video.src = objectUrl;
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};
