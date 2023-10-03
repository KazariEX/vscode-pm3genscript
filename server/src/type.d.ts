import { CstNodeLocation } from "chevrotain";
import { DiagnosticSeverity } from "vscode-languageserver";

export interface PTSParam {
    style: string,
    type?: string,
    value: string,
    location: CstNodeLocation
}

export interface PTSSyntax {
    cmd: string,
    type: string,
    location: CstNodeLocation,
    params: PTSParam[]
}

export interface PTSError {
    message: string,
    location: CstNodeLocation,
    serverity: DiagnosticSeverity,
    relatedInfomation?: PTSErrorRelatedInfomation[]
}

export interface PTSErrorRelatedInfomation {
    message: string,
    location: CstNodeLocation
}