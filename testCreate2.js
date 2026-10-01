async function test() {
  const url = 'https://thuychustudio.id.vn/api/admin/drive/create-folder';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'TEST_API', parentId: '1p-JFojCR9LXcz-cX-GIC43M1NE2rvynM' })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test().catch(console.error);
