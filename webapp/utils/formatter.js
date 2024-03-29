sap.ui.define([]
,
function(){
	return {
		percentage: function(value){
			return (value * 100 / 150); //valeur max 255 (j'ai mis 150)
			 
		},
		color: function(value){
			if (value < 50){
				return sap.ui.core.ValueState.Error;
			}
			if (value >= 50 && value <= 80){
				return sap.ui.core.ValueState.Warning;
			}
			if (value > 80){
				return sap.ui.core.ValueState.Success;
			}
		},
        number: function(value){
            var sNumber = value.substr(34);
			return (sNumber.slice(0, -1));			 
		},
        uppercase: function(value){
			return (value.toUpperCase());			 
		}
	};
});