export default function plugin(data) {
  return data?.length ? data.filter(Boolean) : null;
}
