declare type TicketType = 'black' | 'red' | 'gold' | "";
declare type IBlindTitle = 'SB' | 'BB' | 'Ante';
declare type IBlind = {
  [key in IBlindTitle]: number | string;
};
declare type IGradeTitle = "ticket" | "count" |"point"
declare type IGrade = {
  ticket : TicketType,
  count : string,
  point : string
}
export class CreateRoomsDto {
    roomId: string;
    title:string;
    gameStartDate:string;
    gameStartTime:string;
    deadlineDate:string;
    deadlineTime:string;
    place:string;
    entryCondition:boolean;
    ticketType:TicketType;
    ticketCount:number | string;
    detail:string;
    entry: string;
    prize : string;
    blindTime:string;
    blind:IBlind[];
    grades:IGrade[];
}