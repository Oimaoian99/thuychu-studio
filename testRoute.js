async function test() {
  const url = 'https://thuychustudio.id.vn/api/admin/drive/list?parentId=1LOxR8FuL3kcidWqzwQEIx5hBTTcKLSpx&type=GOC';
  const res = await fetch(url);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test().catch(console.error);
