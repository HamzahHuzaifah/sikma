const db = require('./backend/models');
async function run() {
  try {
    const kelas = await db.Kelas.findAll({ include: [{ model: db.Santri, as: 'santri' }] });
    let count = 0;
    for (let k of kelas) {
      if (!k.santri || k.santri.length === 0) {
        console.log('Deleting empty class:', k.nama);
        await k.destroy();
        count++;
      }
    }
    console.log(`Done. Deleted ${count} empty classes.`);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
run();
