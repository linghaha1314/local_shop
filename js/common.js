async function addItme(ku,data){
    await db[ku].add(data);
}