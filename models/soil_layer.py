class SoilLayer:
    def __init__(self, start_depth=0, end_depth=0, description=""):
        self.start_depth = float(start_depth)
        self.end_depth = float(end_depth)
        self.description = description
    
    def __repr__(self):
        return f"SoilLayer(start_depth={self.start_depth}, end_depth={self.end_depth}, description='{self.description}')"