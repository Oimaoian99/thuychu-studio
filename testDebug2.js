async function test() {
  const url = 'https://thuychustudio.id.vn/api/admin/debug?t=' + Date.now();
  const res = await fetch(url);
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Text:", text.substring(0, 500));
}
test().catch(console.error);
