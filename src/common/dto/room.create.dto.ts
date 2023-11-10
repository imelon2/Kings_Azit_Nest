declare type TicketType = 'black' | 'red' | 'gold' | "";
declare type IBlindTitle = 'SB' | 'BB' | 'Ante';
declare type IBlind = {
  [key in IBlindTitle]: number | string;
};
declare type IGradeTitle = "ticket" | "count" |"point"
declare type IGrade = {
  ticket : TicketType,
  count : string,
  point : string,
  player:string
}
declare type IRoomState = 'wait' | 'start' | 'break' | 'restart';