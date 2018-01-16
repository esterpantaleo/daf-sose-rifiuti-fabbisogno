# Data retrieval and processing
```bash
#downloaded from http://www.opencivitas.it/dataset/2010-fc05b-comuni-funzioni-riguardanti-la-gestione-del-territorio-e-dellambiente-servizio
FABBISOGNI_2010="2010_FC05B_Comuni_Fabbisogni_caratteristiche_prestazioni.csv"
#downloaded from http://www.opencivitas.it/dataset/2013-fc05b-comuni-funzioni-riguardanti-la-gestione-del-territorio-e-dellambiente-servizio
FABBISOGNI_2013="2013_FC05B_Comuni_Fabbisogni_caratteristiche_prestazioni.csv"
#downloaded from http://docs.opencivitas.it/Metadati_Enti_2013_xlsx.zip
METADATA="metadata_fabbisogni_FC05B/Metadati_Enti_2010/Comuni_Province.csv"
#downloaded from http://demo.istat.it/bil20111009/dati/comuni.zip and converted into csv
POPOLAZIONE_2011="./2010/comuni.csv" #al primo gennaio 2011
#downloaded from http://demo.istat.it/bil2013/dati/comuni.zip and converted	into csv
POPOLAZIONE_2013="./2013/comuni.csv"

JOINED_FABBISOGNI="tmp_f"
JOINED_FABBISOGNI_METADATA="tmp2_f"
JOINED="table.csv"
POPOLAZIONE="tmp_p"
JOINED_POPOLAZIONE_METADATA="tmp_m"

join -1 1 -2 1 -t ";" -o 1.1,1.10,1.13,1.14,1.15,1.20,1.21,2.11,2.14,2.15,2.16,2.27,2.28  <(sort -t";" -k 1 ${FABBISOGNI_2010}) <(sort -t";" -k 1 ${FABBISOGNI_2013}) > ${JOINED_FABBISOGNI}
join -1 1 -2 1 -o 1.1,1.2,1.5,2.5 -t ";" <(sort -k 1 ${POPOLAZIONE_2011}) <(sort -t";" -k 1 ${POPOLAZIONE_2013}) > ${POPOLAZIONE}
join -1 1 -2 2 -t ";" -o 1.1,1.2,1.3,1.4,2.1,2.4,2.5,2.6,2.7,2.8,2.9,2.10 <(sort -t";" -k 1 ${POPOLAZIONE}) <(sort -t";" -k 2 ${METADATA}) > ${JOINED_POPOLAZIONE_METADATA}
join -1 1 -2 5 -t ";"   <(sort -t";" -k 1 ${JOINED_FABBISOGNI})  <(sort -t";" -k 5 ${JOINED_POPOLAZIONE_METADATA}) > ${JOINED}
```
```R
dat = read.table("table.csv", sep=";", quote="", header = FALSE)

output = "";
for (j in 1:6699) {
    v1=cbind("COMUNE", "COMUNE_CAT_COD", "AREA_GEO_COD", "REGIONE_DENOMINAZIONE", "PROVINCIA_DES")
    v2=cbind(toString(dat$V15[j]), toString(dat$V1[j]), toString(dat$V23[j]), toString(dat$V22[j]), toString(dat$V20[j]))
    v3=cbind("IND1", "IND5", "IND6", "IND7", "LQP_COD_5", "LQP_COD_6", "POPOLAZIONE")
    v4=cbind(dat$V2[j], dat$V3[j], dat$V4[j], dat$V5[j], dat$V6[j], dat$V7[j], dat$V16[j])
    v5=cbind(dat$V8[j], dat$V9[j], dat$V10[j], dat$V11[j], dat$V12[j], dat$V13[j], dat$V17[j])

    line=""
    for (i in 1:5) {
        line = paste(line, "\"", v1[i], "\":\"", v2[i], "\",", sep="")
    }
    for (i  in 1:7) {
        if (!is.na(v4[i]) && !is.na(v5[i])) {
            line = paste(line, "\"", v3[i], "\":[[2010,", v4[i], "],[2013,", v5[i], "]]", sep=""); 
            if (i != 7) {
                line = paste(line, ",");
            }
        }
        if (is.na(v4[i])) { 
            if (!is.na(v5[i])) {
                line = paste(line, "\"", v3[i], "\": [[2013,", v5[i], "]]", sep="");
            
                if (i != 7) {
                    line = paste(line, ",");
                }
            }
        }
        if (is.na(v5[i])) { 
            if (!is.na(v4[i])) {
                line = paste(line, "\"", v3[i], "\": [[2010,", v4[i], "]]", sep="");
            
                if (i != 7) {
                    line = paste(line, ",");
                }
            }
        }
    }
    output = paste(output, "{", line, "},");
}
write(output, "file.json")
```