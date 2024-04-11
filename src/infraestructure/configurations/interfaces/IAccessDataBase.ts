export interface IAccessDataBase {
    operatorAliases: boolean;
    dialect: string;
    primary_db: IConnectionData;
    reports_db: IConnectionData;
}
