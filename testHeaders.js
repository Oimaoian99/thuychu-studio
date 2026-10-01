async function test() {
  const url = 'https://thuychustudio.id.vn/api/admin/drive/list?parentId=1LOxR8FuL3kcidWqzwQEIx5hBTTcKLSpx&type=GOC';
  const res = await fetch(url);
  console.log("Status:", res.status);
  console.log("Headers:");
  res.headers.forEach((v, k) => console.log(k, ":", v));
}
test().catch(console.error);
