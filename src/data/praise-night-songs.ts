// Praise Night Songs Data - specific to praise night page
export interface PraiseNightSong {
  title: string;
  status: 'heard' | 'unheard';
  category: string;
  singer: string;
  lyrics: {
    verse1: string;
    chorus: string;
    verse2: string;
    bridge: string;
  };
  leadSinger: string;
  writtenBy: string;
  key: string;
  tempo: string;
  comments: string;
}

export interface PraiseNight {
  id: number;
  name: string;
  date: string;
  location: string;
  songs: PraiseNightSong[];
  countdown: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

// Sample data for Praise Night 25
const praiseNight25Songs: PraiseNightSong[] = [
  {
    title: "Mighty God",
    status: "heard",
    category: "New Praise Songs",
    singer: "Sarah Johnson",
    lyrics: {
      verse1: "Great is Thy faithfulness, O God my Father\nThere is no shadow of turning with Thee\nThou changest not, Thy compassions they fail not\nAs Thou hast been Thou forever wilt be",
      chorus: "Great is Thy faithfulness\nGreat is Thy faithfulness\nMorning by morning new mercies I see\nAll I have needed Thy hand hath provided",
      verse2: "Summer and winter, and springtime and harvest\nSun, moon and stars in their courses above\nJoin with all nature in manifold witness\nTo Thy great faithfulness, mercy and love",
      bridge: "Pardon for sin and a peace that endureth\nThine own dear presence to cheer and to guide\nStrength for today and bright hope for tomorrow\nBlessings all mine, with ten thousand beside"
    },
    leadSinger: "Sarah Johnson",
    writtenBy: "Pastor Chris Oyakhilome",
    key: "G Major",
    tempo: "72 BPM",
    comments: "This song should be sung with deep reverence and heartfelt emotion. Allow the congregation to really feel the weight of God's amazing grace."
  },
  {
    title: "Victory Chant",
    status: "unheard",
    category: "New Praise Songs",
    singer: "Michael Thompson",
    lyrics: {
      verse1: "We have the victory in Jesus\nWe have the victory in Jesus\nWe have the victory in Jesus\nHallelujah, we have the victory",
      chorus: "No weapon formed against us shall prosper\nNo weapon formed against us shall prosper\nWe have the victory in Jesus\nHallelujah, we have the victory",
      verse2: "We overcome by the blood of the Lamb\nWe overcome by the word of our testimony\nWe have the victory in Jesus\nHallelujah, we have the victory",
      bridge: "Greater is He that is in me\nThan he that is in the world\nWe have the victory in Jesus\nHallelujah, we have the victory"
    },
    leadSinger: "Michael Thompson",
    writtenBy: "Pastor Chris Oyakhilome",
    key: "D Major",
    tempo: "120 BPM",
    comments: "We have the victory in Jesus! This song should be sung with power and conviction. Let the congregation feel the triumph."
  },
  {
    title: "Celebrate Jesus",
    status: "heard",
    category: "New Praise Songs",
    singer: "Grace Williams",
    lyrics: {
      verse1: "Celebrate Jesus, celebrate\nCelebrate Jesus, celebrate\nHe is risen from the dead\nCelebrate Jesus, celebrate",
      chorus: "He's the King of kings and Lord of lords\nCelebrate Jesus, celebrate\nHe's the Alpha and Omega\nCelebrate Jesus, celebrate",
      verse2: "He's the way, the truth, and the life\nCelebrate Jesus, celebrate\nHe's the resurrection and the life\nCelebrate Jesus, celebrate",
      bridge: "Worthy is the Lamb that was slain\nCelebrate Jesus, celebrate\nTo receive power and riches and wisdom\nCelebrate Jesus, celebrate"
    },
    leadSinger: "Grace Williams",
    writtenBy: "Pastor Chris Oyakhilome",
    key: "C Major",
    tempo: "110 BPM",
    comments: "Celebrate Jesus, celebrate! This is a joyful song that should lift everyone's spirits. Sing with enthusiasm and joy."
  },
  {
    title: "Shout to the Lord",
    status: "unheard",
    category: "New Praise Songs",
    singer: "David Kim",
    lyrics: {
      verse1: "My Jesus, my Savior\nLord there is none like You\nAll of my days I want to praise\nThe wonders of Your mighty love",
      chorus: "Shout to the Lord all the earth let us sing\nPower and majesty praise to the King\nMountains bow down and the seas will roar\nAt the sound of Your name",
      verse2: "I sing for joy at the work of Your hands\nForever I'll love You, forever I'll stand\nNothing compares to the promise I have in You",
      bridge: "My comfort, my shelter\nTower of refuge and strength\nLet every breath, all that I am\nNever cease to worship You"
    },
    leadSinger: "David Kim",
    writtenBy: "Darlene Zschech",
    key: "F Major",
    tempo: "80 BPM",
    comments: "My Jesus, my Savior, Lord there is none like You. This is a powerful worship song that should be sung with deep reverence and love."
  }
];

// Sample data for Your Loveworld Special
const loveworldSpecialSongs: PraiseNightSong[] = [
  {
    title: "Amazing Grace",
    status: "heard",
    category: "Special Songs",
    singer: "Sarah Johnson",
    lyrics: {
      verse1: "Amazing grace, how sweet the sound\nThat saved a wretch like me\nI once was lost, but now am found\nWas blind, but now I see",
      chorus: "T'was grace that taught my heart to fear\nAnd grace my fears relieved\nHow precious did that grace appear\nThe hour I first believed",
      verse2: "Through many dangers, toils and snares\nI have already come\n'Tis grace hath brought me safe thus far\nAnd grace will lead me home",
      bridge: "When we've been there ten thousand years\nBright shining as the sun\nWe've no less days to sing God's praise\nThan when we'd first begun"
    },
    leadSinger: "Sarah Johnson",
    writtenBy: "John Newton",
    key: "G Major",
    tempo: "60 BPM",
    comments: "Amazing grace, how sweet the sound. This classic hymn should be sung with deep reverence and gratitude."
  },
  {
    title: "How Great Thou Art",
    status: "unheard",
    category: "Special Songs",
    singer: "Michael Thompson",
    lyrics: {
      verse1: "O Lord my God, when I in awesome wonder\nConsider all the worlds Thy hands have made\nI see the stars, I hear the rolling thunder\nThy power throughout the universe displayed",
      chorus: "Then sings my soul, my Savior God, to Thee\nHow great Thou art, how great Thou art\nThen sings my soul, my Savior God, to Thee\nHow great Thou art, how great Thou art",
      verse2: "When through the woods and forest glades I wander\nAnd hear the birds sing sweetly in the trees\nWhen I look down from lofty mountain grandeur\nAnd hear the brook and feel the gentle breeze",
      bridge: "And when I think that God, His Son not sparing\nSent Him to die, I scarce can take it in\nThat on the cross, my burden gladly bearing\nHe bled and died to take away my sin"
    },
    leadSinger: "Michael Thompson",
    writtenBy: "Stuart Hine",
    key: "C Major",
    tempo: "70 BPM",
    comments: "O Lord my God, when I in awesome wonder. This powerful hymn should be sung with awe and reverence."
  }
];

// Praise Nights data
export const praiseNights: PraiseNight[] = [
  {
    id: 25,
    name: "Praise Night 25",
    date: "21st September 2025",
    location: "Oasis Studio",
    songs: praiseNight25Songs,
    countdown: {
      days: 11,
      hours: 7,
      minutes: 48,
      seconds: 0
    }
  },
  {
    id: 26,
    name: "Your Loveworld Special",
    date: "21st September 2025", 
    location: "Oasis Studio",
    songs: loveworldSpecialSongs,
    countdown: {
      days: 5,
      hours: 12,
      minutes: 30,
      seconds: 0
    }
  }
];

let currentPraiseNightId = 25;

// Functions to manage praise nights
export function getCurrentPraiseNight(): PraiseNight {
  return praiseNights.find(pn => pn.id === currentPraiseNightId) || praiseNights[0];
}

export function setCurrentPraiseNight(id: number) {
  currentPraiseNightId = id;
}

export function getAllPraiseNights(): PraiseNight[] {
  return praiseNights;
}

export function getCurrentSongs(): PraiseNightSong[] {
  return getCurrentPraiseNight().songs;
}
