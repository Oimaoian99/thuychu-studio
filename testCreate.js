async function test() {
  const url = 'https://thuychustudio.id.vn/api/admin/drive/create-folder';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folderName: 'TEST_API' })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test().catch(console.error);
