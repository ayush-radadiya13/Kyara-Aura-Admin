import { ADMIN_API_ROUTES } from "@/lib/routes";
import { customAxios } from "@/utils/api";

function getUploadedMediaUrl(response) {
  const data = response?.data;
  const candidates = [
    response?.url,
    response?.path,
    response?.file,
    response?.image,
    response?.location,
    data?.url,
    data?.path,
    data?.file,
    data?.image,
    data?.location,
    data?.secure_url,
    data?.file_url,
    data?.image_url,
    data?.video_url,
    data?.video,
    data?.media_url,
    data?.urls?.[0],
    data?.files?.[0],
  ];

  const uploadedUrl = candidates.find((value) => typeof value === "string" && value.trim());

  if (uploadedUrl) {
    return uploadedUrl;
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  throw new Error("Upload succeeded, but no media URL was returned.");
}

export async function uploadMediaFile(file, folder) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const { data } = await customAxios.post(ADMIN_API_ROUTES.MEDIA_UPLOAD, formData);
  return getUploadedMediaUrl(data);
}
