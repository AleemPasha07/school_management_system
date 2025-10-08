import toast from "react-hot-toast";
export const toastSuccess = (msg = "Done") => toast.success(msg);
export const toastError = (err, fallback = "Something went wrong") =>
  toast.error(err?.response?.data?.error || err?.message || fallback);