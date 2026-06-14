import path from "path";

/** Persistent data root — use /data on Fly.io volume, project root on EC2 */
export function getDataDir() {
  return process.env.DATA_DIR || process.cwd();
}

export function getUploadsDir(subfolder: string) {
  return path.join(getDataDir(), "uploads", subfolder);
}

export function getUploadsRoot() {
  return path.join(getDataDir(), "uploads");
}
