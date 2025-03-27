class SPTData:
    def __init__(self, depth=0, cota=None, amostra=None, golpes_inicial=0, golpes_final=0, has_water_level=False):
        self.depth = float(depth)
        self.cota = float(cota) if cota is not None else None
        self.amostra = amostra
        self.golpes_inicial = int(golpes_inicial) if golpes_inicial else 0
        self.golpes_final = int(golpes_final) if golpes_final else 0
        self.has_water_level = has_water_level
    
    def __repr__(self):
        return f"SPTData(depth={self.depth}, cota={self.cota}, amostra='{self.amostra}', golpes_inicial={self.golpes_inicial}, golpes_final={self.golpes_final}, has_water_level={self.has_water_level})"