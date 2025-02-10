# travel_service.py
from spyne import Application, rpc, ServiceBase, Float, Integer, String, ComplexModel
from spyne.protocol.soap import Soap11
from spyne.server.wsgi import WsgiApplication

class TravelResponse(ComplexModel):
    """ Modèle de réponse pour le service SOAP """
    __namespace__ = "spyne.examples.travel.soap"
    time = String
    cost = String
    charges = Integer

class TravelCalculatorService(ServiceBase):
    """
    Service SOAP qui calcule un temps total de trajet et un coût,
    en tenant compte de la distance, de l'autonomie et du temps de recharge.
    """

    @rpc(
        Float,    # distance (km)
        Float,    # vitesse moyenne (km/h)
        Float,    # autonomie (km)
        Integer,  # temps de recharge (minutes) pour une recharge complète
        Float,    # coût par km
        _returns=TravelResponse
    )
    def calculate_trip(
        ctx,
        distance_km,
        avg_speed_kmh,
        autonomy_km,
        charge_time_min,
        cost_per_km
    ):
        """
        Calcule et renvoie le temps total du trajet, le coût et le nombre de recharges nécessaires.
        """

        # 1) Calcul du temps de conduite
        drive_time_h = distance_km / avg_speed_kmh  # en heures

        # 2) Calcul du nombre de recharges nécessaires
        distance_restante = max(0, distance_km - autonomy_km)
        nb_recharges = 0 if distance_restante <= 0 else int((distance_restante - 1) // autonomy_km + 1)

        # 3) Calcul du temps total de recharge
        total_charge_time_h = (nb_recharges * charge_time_min) / 60.0  # en heures

        # 4) Temps total (heures)
        total_time_h = drive_time_h + total_charge_time_h

        # 5) Calcul du coût total
        total_cost = distance_km * cost_per_km

        # 6) Mise en forme de la réponse
        hours = int(total_time_h)
        minutes = int((total_time_h - hours) * 60)

        return TravelResponse(
            time=f"{hours}h{minutes:02d}",
            cost=f"{total_cost:.2f} €",
            charges=nb_recharges
        )

# Configuration de l’application SOAP
application = Application(
    [TravelCalculatorService],
    tns='spyne.examples.travel.soap',
    in_protocol=Soap11(validator='lxml'),
    out_protocol=Soap11()
)

# Application WSGI
wsgi_application = WsgiApplication(application)

# Point d'entrée
if __name__ == '__main__':
    from wsgiref.simple_server import make_server
    print("Lancement du service sur http://127.0.0.1:8000")
    server = make_server('127.0.0.1', 8000, wsgi_application)
    server.serve_forever()
