async function test() {
  const url = 'https://thuychustudio.id.vn/api/admin/drive/list?parentId=15YYjGbSGB7_QVRFbffDY25HPuQMJ7Chx&type=GOC&t=' + Date.now();
  const res = await fetch(url);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test().catch(console.error);
