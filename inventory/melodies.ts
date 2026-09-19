import type { CorpusMelody, Melody } from "../music/melody.ts";
import { normalizeMelody } from "../music/melody.ts";
import { amazingGrace } from "./melodies/amazing-grace.ts";
import { auClairDeLaLune } from "./melodies/au-clair-de-la-lune.ts";
import { auldLangSyne } from "./melodies/auld-lang-syne.ts";
import { auraLee } from "./melodies/aura-lee.ts";
import { awayInAManger } from "./melodies/away-in-a-manger.ts";
import { baaBaaBlackSheep } from "./melodies/baa-baa-black-sheep.ts";
import { battleHymn } from "./melodies/battle-hymn.ts";
import { blueBellsOfScotland } from "./melodies/blue-bells-of-scotland.ts";
import { camptownRaces } from "./melodies/camptown-races.ts";
import { clementine } from "./melodies/clementine.ts";
import { downInTheValley } from "./melodies/down-in-the-valley.ts";
import { drunkenSailor } from "./melodies/drunken-sailor.ts";
import { farmerInTheDell } from "./melodies/farmer-in-the-dell.ts";
import { forHesAJollyGoodFellow } from "./melodies/for-hes-a-jolly-good-fellow.ts";
import { frereJacques } from "./melodies/frere-jacques.ts";
import { goTellItOnTheMountain } from "./melodies/go-tell-it-on-the-mountain.ts";
import { godRestYeMerryGentlemen } from "./melodies/god-rest-ye-merry-gentlemen.ts";
import { goodKingWenceslas } from "./melodies/good-king-wenceslas.ts";
import { greensleeves } from "./melodies/greensleeves.ts";
import { happyBirthday } from "./melodies/happy-birthday.ts";
import { hickoryDickoryDock } from "./melodies/hickory-dickory-dock.ts";
import { homeOnTheRange } from "./melodies/home-on-the-range.ts";
import { hotCrossBuns } from "./melodies/hot-cross-buns.ts";
import { hushLittleBaby } from "./melodies/hush-little-baby.ts";
import { itsyBitsySpider } from "./melodies/itsy-bitsy-spider.ts";
import { jingleBells } from "./melodies/jingle-bells.ts";
import { joyToTheWorld } from "./melodies/joy-to-the-world.ts";
import { kumbaya } from "./melodies/kumbaya.ts";
import { lavendersBlue } from "./melodies/lavenders-blue.ts";
import { lightlyRow } from "./melodies/lightly-row.ts";
import { lochLomond } from "./melodies/loch-lomond.ts";
import { londonBridge } from "./melodies/london-bridge.ts";
import { mary } from "./melodies/mary.ts";
import { michaelRowTheBoatAshore } from "./melodies/michael-row-the-boat-ashore.ts";
import { minuetInG } from "./melodies/minuet-in-g.ts";
import { mulberryBush } from "./melodies/mulberry-bush.ts";
import { myBonnie } from "./melodies/my-bonnie.ts";
import { oComeAllYeFaithful } from "./melodies/o-come-all-ye-faithful.ts";
import { odeToJoy } from "./melodies/ode-to-joy.ts";
import { ohSusanna } from "./melodies/oh-susanna.ts";
import { ohWhereHasMyLittleDogGone } from "./melodies/oh-where-has-my-little-dog-gone.ts";
import { oldMacdonald } from "./melodies/old-macdonald.ts";
import { orangesAndLemons } from "./melodies/oranges-and-lemons.ts";
import { pollyPutTheKettleOn } from "./melodies/polly-put-the-kettle-on.ts";
import { popGoesTheWeasel } from "./melodies/pop-goes-the-weasel.ts";
import { redRiverValley } from "./melodies/red-river-valley.ts";
import { ringAroundTheRosie } from "./melodies/ring-around-the-rosie.ts";
import { rockAByeBaby } from "./melodies/rock-a-bye-baby.ts";
import { rowYourBoat } from "./melodies/row-your-boat.ts";
import { scarboroughFair } from "./melodies/scarborough-fair.ts";
import { shellBeComingRoundTheMountain } from "./melodies/shell-be-coming-round-the-mountain.ts";
import { shenandoah } from "./melodies/shenandoah.ts";
import { shooFly } from "./melodies/shoo-fly.ts";
import { silentNight } from "./melodies/silent-night.ts";
import { simpleGifts } from "./melodies/simple-gifts.ts";
import { singASongOfSixpence } from "./melodies/sing-a-song-of-sixpence.ts";
import { skipToMyLou } from "./melodies/skip-to-my-lou.ts";
import { swingLow } from "./melodies/swing-low.ts";
import { theFirstNoel } from "./melodies/the-first-noel.ts";
import { thisOldMan } from "./melodies/this-old-man.ts";
import { threeBlindMice } from "./melodies/three-blind-mice.ts";
import { twinkle } from "./melodies/twinkle.ts";
import { weWishYouAMerryChristmas } from "./melodies/we-wish-you-a-merry-christmas.ts";
import { whatChildIsThis } from "./melodies/what-child-is-this.ts";
import { whenTheSaints } from "./melodies/when-the-saints.ts";
import { yankeeDoodle } from "./melodies/yankee-doodle.ts";

export const MELODY_CORPUS: CorpusMelody[] = [
  twinkle,
  mary,
  happyBirthday,
  odeToJoy,
  rowYourBoat,
  jingleBells,
  frereJacques,
  londonBridge,
  oldMacdonald,
  hotCrossBuns,
  yankeeDoodle,
  thisOldMan,
  amazingGrace,
  auClairDeLaLune,
  lightlyRow,
  threeBlindMice,
  baaBaaBlackSheep,
  rockAByeBaby,
  hushLittleBaby,
  pollyPutTheKettleOn,
  singASongOfSixpence,
  ringAroundTheRosie,
  itsyBitsySpider,
  farmerInTheDell,
  mulberryBush,
  popGoesTheWeasel,
  skipToMyLou,
  shooFly,
  ohSusanna,
  camptownRaces,
  shellBeComingRoundTheMountain,
  whenTheSaints,
  homeOnTheRange,
  myBonnie,
  auldLangSyne,
  lavendersBlue,
  orangesAndLemons,
  hickoryDickoryDock,
  clementine,
  redRiverValley,
  drunkenSailor,
  swingLow,
  goTellItOnTheMountain,
  kumbaya,
  michaelRowTheBoatAshore,
  simpleGifts,
  shenandoah,
  auraLee,
  battleHymn,
  scarboroughFair,
  greensleeves,
  minuetInG,
  blueBellsOfScotland,
  lochLomond,
  downInTheValley,
  ohWhereHasMyLittleDogGone,
  forHesAJollyGoodFellow,
  weWishYouAMerryChristmas,
  silentNight,
  awayInAManger,
  goodKingWenceslas,
  theFirstNoel,
  oComeAllYeFaithful,
  joyToTheWorld,
  godRestYeMerryGentlemen,
  whatChildIsThis,
];

export const MELODIES: Melody[] = MELODY_CORPUS.map((entry) => {
  const result = normalizeMelody(entry);
  if (!result.ok) throw new Error(result.error);
  return result.value;
});
