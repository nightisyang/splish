const fs = require("fs");
const path = require("path");

const files = fs.readdirSync(path.join(__dirname, "data", "waterfalls"));
const compiledURL = [
  "164ayerputeri.php",
  "98kotatinggi.php",
  "58ledang.php",
  "99pulai.php",
  "128takamelor.php",
  "159asahan.php",
  "161jeramtinggi.php",
  "122lemako.php",
  "24pelapah.php",
  "85selai.php",
  "100yong.php",
  "121upehguling.php",
  "64buayasangkut.php",
  "127tengkil.php",
  "168alurnaga.php",
  "167badak.php",
  "95batuhampar.php",
  "63bukithijau.php",
  "62durianperangin.php",
  "144junjong.php",
  "74latabayu.php",
  "154hujanlebat.php",
  "75mengkuang.php",
  "93peranginsik.php",
  "92puterimandi.php",
  "119serdang.php",
  "69telagatujoh.php",
  "68temurun.php",
  "103ulupaip.php",
  "Nfalls/txn76bhrd.php",
  "73perigi.php",
  "113jagong.php",
  "88linang.php",
  "05jerampasu.php",
  "09berangin.php",
  "170janggut.php",
  "169kertas.php",
  "34rek.php",
  "148stong.php",
  "183Belihoi.php",
  "61JDagang.php",
  "12jeramkedah.php",
  "176JeramRusa.php",
  "11jeramtebrau.php",
  "14jeramtengkek.php",
  "13jeramtoi.php",
  "180Pasong.php",
  "15serting.php",
  "179Tambak.php",
  "16ulubendol.php",
  "76BktTampin.php",
  "178Glami.php",
  "184Lambar.php",
  "137JNerai.php",
  "194LBerembunN9.php",
  "42kijang.php",
  "22bertangga.php",
  "25chamang.php",
  "56jeriau.php",
  "26jarum.php",
  "90lembik.php",
  "21meraung.php",
  "101lentang.php",
  "17pandan.php",
  "08parit.php",
  "79robinson.php",
  "91khong.php",
  "130srimahkota.php",
  "136teladas.php",
  "19berkelah.php",
  "39gapoi.php",
  "186Genuai.php",
  "87jerangkang.php",
  "123lattocaruk.php",
  "185LataWoh.php",
  "104hammers.php",
  "18rainbow.php",
  "65seminyang.php",
  "38tanglir.php",
  "40terapai.php",
  "155harimauberjemur.php",
  "41berembun.php",
  "94cemperoh.php",
  "105kenip.php",
  "66nyangung.php",
  "145salan.php",
  "32batuferringhi.php",
  "33kerawang.php",
  "78waterfall.php",
  "80berangkai.php",
  "132bukitjana.php",
  "45buntong.php",
  "28gepai.php",
  "82geruntum.php",
  "156batupecah.php",
  "27iskandar.php",
  "31latakekabu.php",
  "29kinjang.php",
  "115perahu.php",
  "139tebingtinggi.php",
  "171penyel.php",
  "153chepor.php",
  "81lubuktimah.php",
  "60papan.php",
  "10salu.php",
  "46sinju.php",
  "138tupai.php",
  "165ululecin.php",
  "131airhitam.php",
  "158belum.php",
  "195Bersih.php",
  "57chelik.php",
  "97damak.php",
  "163kait.php",
  "37kamunting.php",
  "166payong.php",
  "49latakala.php",
  "67yuk.php",
  "Nfalls/txn55lond.php",
  "36maxwell.php",
  "47tebingtinggi.php",
  "30trong.php",
  "48lataputeh.php",
  "102strata.php",
  "54tibang.php",
  "129tigok.php",
  "112kinabalu.php",
  "151kionsom.php",
  "140madai.php",
  "106mahua.php",
  "96maliau.php",
  "111bobak.php",
  "147kubah.php",
  "116latak.php",
  "118ranchan.php",
  "107santubong.php",
  "143klimau.php",
  "117gading.php",
  "125jangkar.php",
  "110banbuan.php",
  "109lambir.php",
  "126sebarau.php",
  "142tajor.php",
  "141julan.php",
  "200Cheh.php",
  "06gabai.php",
  "191JAnjang.php",
  "01kanching.php",
  "134komanwel.php",
  "03perigitujoh.php",
  "04sendat.php",
  "52serendah.php",
  "53sungeitua.php",
  "07tekala.php",
  "86batangsi.php",
  "177BatuAsah.php",
  "192BBerayun.php",
  "174BatuBertengkek.php",
  "187BtCherandong.php",
  "193BKapal.php",
  "114bukitapeh.php",
  "51chiling.php",
  "173gapi.php",
  "172gapok.php",
  "120jeramperlus.php",
  "124kedongdong.php",
  "189LBeringinSemungkis.php",
  "150medang.php",
  "133lawing.php",
  "83lepok.php",
  "84lolo.php",
  "20lubukkawah.php",
  "182Masai.php",
  "175Pangsun.php",
  "44perdik.php",
  "50pisang.php",
  "149setinggi.php",
  "77ampang.php",
  "152luit.php",
  "43siong.php",
  "181Tarun.php",
  "02templar.php",
  "157ulutamu.php",
  "35sekayu.php",
  "89belukar.php",
  "70belatan.php",
  "71tembakah.php",
  "135penitih.php",
  "59kenyir.php",
  "72cemerong.php",
  "160seru.php",
  "146belawan.php",
];
let shortlist = [];

console.log(files);

let errorCollector = [];

for (let i = 1; i < files.length; i++) {
  const jsonObj = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data", "waterfalls", `${files[i]}`))
  );

  if (jsonObj.url) {
    shortlist.push(compiledURL.splice(compiledURL.indexOf(files[i])));
  }
}

console.log(compiledURL);

[
  "Asahan Fall.json",
  "Ayer Puteh.json",
  "Jeram Tinggi.json",
  "Kota Tinggi.json",
  "Pulai Falls.json",
  "Puteri Fall.json",
  "Taka Melor.json",
];

[
  "164ayerputeri.php",
  "98kotatinggi.php",
  "58ledang.php",
  "99pulai.php",
  "128takamelor.php",
  "159asahan.php",
  "161jeramtinggi.php",
];
