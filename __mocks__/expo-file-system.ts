export const documentDirectory = null;
export const cacheDirectory = null;
export const bundleDirectory = null;
export async function getInfoAsync(_uri: string) {
  return { exists: true, size: 1024, isDirectory: false, modificationTime: Date.now() };
}
export async function readAsStringAsync(_uri: string) { return ''; }
export async function writeAsStringAsync(_uri: string, _content: string) {}
export async function deleteAsync(_uri: string) {}
export async function moveAsync(_options: { from: string; to: string }) {}
export async function copyAsync(_options: { from: string; to: string }) {}
export async function makeDirectoryAsync(_dir: string) {}
export async function readDirectoryAsync(_dir: string) { return []; }
export const FileSystemSessionType = { BACKGROUND: 0, FOREGROUND: 1 };
export const FileSystemUploadType = { BINARY_CONTENT: 0, MULTIPART: 1 };
export const EncodingType = { UTF8: 'utf8', Base64: 'base64' };
