/**
 * 皮克敏蘑菇隨機點位名稱庫
 */
export const RANDOM_MUSHROOM_LOCATIONS = [
  '大安森林公園音樂台',
  '二二八和平公園水池',
  '台北車站南門廣場',
  '台大醉月湖畔石橋',
  '中正紀念堂東側迴廊',
  '陽明山花鐘廣場',
  '信義香堤大道樹蔭處',
  '松山文創園區生態池',
  '華山1914紅磚倉庫群',
  '捷運站出口噴水池',
  '秋紅谷景觀生態公園',
  '台中國家歌劇院廣場',
  '勤美誠品綠園道草坪',
  '駁二藝術特區大公仔',
  '高雄流行音樂中心海風廣場',
  '台南奇美博物館阿波羅噴泉',
  '成大光復校區百年榕園',
  '新竹市立動物園大門',
  '中央公園飛行遊戲場',
  '街角星巴克木棧道',
  '社區活動中心彩繪牆',
  '郵局門前雙色郵筒',
  '河濱自行車道觀景涼亭',
  '百年老土地公廟前牌樓',
  '國民小學校門鐘樓',
  '社區兒童公園溜滑梯',
  '圖書館前裝置藝術銅雕',
  '體育場司令台後方步道'
];

export function getRandomMushroomName(): string {
  const index = Math.floor(Math.random() * RANDOM_MUSHROOM_LOCATIONS.length);
  return RANDOM_MUSHROOM_LOCATIONS[index];
}
