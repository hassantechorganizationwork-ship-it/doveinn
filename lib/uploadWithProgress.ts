// fetch() has no upload-progress event, so multipart submissions that need
// a real progress bar (not a fake timer) have to go through XMLHttpRequest,
// which is the only browser API that exposes xhr.upload.onprogress.
export function uploadWithProgress(
  url: string,
  body: FormData,
  onProgress: (percent: number) => void
): Promise<{ status: number; json: unknown }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const json = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        resolve({ status: xhr.status, json });
      } catch {
        reject(new Error("Server returned an invalid response"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(body);
  });
}
