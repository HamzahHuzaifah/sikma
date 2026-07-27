const { Op } = require('sequelize');

async function generateNomorKwitansi(model, instance, kodeJenis) {
    if (instance.nomor_kwitansi) return; // Already generated

    const Lembaga = model.sequelize.models.Lembaga;
    if (!Lembaga) return;

    const lembaga = await Lembaga.findByPk(instance.lembagaId);
    if (!lembaga) return;

    let kodeLembaga = lembaga.nama.toUpperCase().trim();
    if (kodeLembaga.includes('MADRASAH') || kodeLembaga.includes('JAMI')) kodeLembaga = 'MJIC';
    else if (kodeLembaga.includes('PAUDQU')) kodeLembaga = 'PAUDQU';
    else if (kodeLembaga.includes('TPQ')) kodeLembaga = 'TPQ';
    else if (kodeLembaga.includes('MDT')) kodeLembaga = 'MDT';
    else kodeLembaga = kodeLembaga.substring(0, 4); // Fallback

    const dateObj = new Date(instance.tanggal || new Date());
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const prefix = `${kodeLembaga}-${kodeJenis}-${mm}${yyyy}-`;

    const lastRecord = await model.findOne({
        where: {
            nomor_kwitansi: {
                [Op.like]: `${prefix}%`
            }
        },
        order: [['nomor_kwitansi', 'DESC']],
        attributes: ['nomor_kwitansi']
    });

    let nextNumber = 1;
    if (lastRecord && lastRecord.nomor_kwitansi) {
        const parts = lastRecord.nomor_kwitansi.split('-');
        const lastSequenceStr = parts[parts.length - 1];
        const lastSequence = parseInt(lastSequenceStr, 10);
        if (!isNaN(lastSequence)) {
            nextNumber = lastSequence + 1;
        }
    }

    const sequenceStr = String(nextNumber).padStart(4, '0');
    instance.nomor_kwitansi = `${prefix}${sequenceStr}`;
}

module.exports = { generateNomorKwitansi };
