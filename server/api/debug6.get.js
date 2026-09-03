export default defineEventHandler(async (event) => {
  try {
    const res = await $fetch('/api/public/home');
    return res;
  } catch (error) {
    return { error: error.message, data: error.data };
  }
});
