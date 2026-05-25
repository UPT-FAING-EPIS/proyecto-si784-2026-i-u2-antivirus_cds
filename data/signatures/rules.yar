rule EjemploMalware {
    strings:
        $a = "evil_payload" ascii
        $b = { 6A 00 68 00 00 00 00 }
    condition:
        $a or $b
}