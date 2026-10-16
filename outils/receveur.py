# -*- coding: utf-8 -*-
"""Recoit un JSON depuis une page du navigateur et l'ecrit dans un fichier.

       python outils/receveur.py sortie.json [port]

   Certaines verifications ne peuvent se faire que dans le navigateur : c'est
   la que tourne le vrai moteur du jeu, et lui seul choisit l'enregistrement
   qu'Apple servira. Le resultat doit pourtant redescendre sur le disque. Faire
   transiter trente kilo-octets par la conversation serait du gaspillage ; une
   page peut les poster ici en une fois.

   Ecoute sur 127.0.0.1 uniquement, s'arrete des qu'elle a recu son fichier.
"""
import io, json, sys
try:
    from http.server import BaseHTTPRequestHandler, HTTPServer
except ImportError:                                   # python 2
    from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer

SORTIE = sys.argv[1] if len(sys.argv) > 1 else "recu.json"
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8778


class Recoit(BaseHTTPRequestHandler):
    def _entete(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "content-type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")

    def do_OPTIONS(self):
        self.send_response(204)
        self._entete()
        self.end_headers()

    def do_POST(self):
        n = int(self.headers.get("content-length") or 0)
        brut = self.rfile.read(n).decode("utf-8", "replace")
        self.send_response(200)
        self._entete()
        self.end_headers()
        self.wfile.write(b"ok")
        try:
            d = json.loads(brut)
        except ValueError as e:
            print(u"JSON illisible : %s" % e)
            return
        io.open(SORTIE, "w", encoding="utf-8").write(json.dumps(d, ensure_ascii=False, indent=1))
        print(u"%d octets reçus, écrits dans %s" % (n, SORTIE))
        self.server.recu = True

    def log_message(self, *a):
        pass


s = HTTPServer(("127.0.0.1", PORT), Recoit)
s.recu = False
print(u"en écoute sur http://127.0.0.1:%d" % PORT)
while not s.recu:
    s.handle_request()
print(u"terminé")
