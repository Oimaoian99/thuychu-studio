async function test() {
  const url = 'https://thuychu-studio.haan9xct.workers.dev/api/admin/drive/list?parentId=15YYjGbSGB7_QVRFbffDY25HPuQMJ7Chx&type=GOC';
  const res = await fetch(url);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test().catch(console.error);
