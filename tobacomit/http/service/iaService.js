const { Response } = require('../../config/response');

class IaService {

    parseDate(dateString) {
        if (!dateString) return null;
        
        if (dateString instanceof Date) {
            return dateString;
        }
        
        const dateStr = String(dateString).trim();
        
        console.log('Parsing date string:', dateStr);
        
        const ddMMyyyyMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})(?:\s+\d{2}:\d{2}:\d{2})?$/);
        if (ddMMyyyyMatch) {
            const [, day, month, year] = ddMMyyyyMatch;
            console.log('Matched DD-MM-YYYY format:', day, month, year);
            const date = new Date(Date.UTC(year, month - 1, day));
            console.log('Created date:', date.toISOString());
            return date;
        }
        
        const yyyyMMddMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+\d{2}:\d{2}:\d{2})?$/);
        if (yyyyMMddMatch) {
            const [, year, month, day] = yyyyMMddMatch;
            console.log('Matched YYYY-MM-DD format:', year, month, day);
            const date = new Date(Date.UTC(year, month - 1, day));
            console.log('Created date:', date.toISOString());
            return date;
        }
        
        if (dateStr.includes('T') || dateStr.includes('Z')) {
            return new Date(dateStr);
        }
        
        const parsed = new Date(dateStr);
        if (isNaN(parsed.getTime())) {
            throw new Error(`Invalid date format: ${dateString}`);
        }
        console.log('Parsed with standard Date():', parsed.toISOString());
        return parsed;
    }

    async getModelSentence(date) {
        try {
            if(date == undefined) {
                return new Response(400, 'Date is required', null);
            }
            
            console.log('Raw date received:', date, 'Type:', typeof date);
            
            const stopDate = this.parseDate(date);
            if (!stopDate) {
                return new Response(400, 'Invalid date format', null);
            }

            const now = new Date();
            now.setHours(0, 0, 0, 0);
            stopDate.setHours(0, 0, 0, 0);
            
            const diffTime = now - stopDate;
            const days = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
            
            console.log('Raw date:', date);
            console.log('Parsed stop date:', stopDate.toISOString(), 'Local:', stopDate.toLocaleDateString('fr-FR'));
            console.log('Today:', now.toISOString(), 'Local:', now.toLocaleDateString('fr-FR'));
            console.log('Days difference:', days);
            
            if (days < 0) {
                return new Response(400, 'The stop date cannot be in the future', null);
            }
            const response = await fetch("http://localhost:11434/api/generate", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'phi4',
                    prompt: `Tu es un coach motivationnel spécialisé dans l'arrêt du tabac. L'utilisateur a arrêté de fumer il y a ${days} jours.

INSTRUCTIONS STRICTES :
- Réponds UNIQUEMENT par une phrase courte et percutante (type slogan motivant)
- Maximum 2 phrases, pas plus
- OBLIGATOIRE : Inclus un calcul ou une comparaison concrète et RÉALISTE basée sur ${days} jours
- Sois direct, encourageant et positif
- NE DONNE AUCUNE EXPLICATION, aucun préambule, aucun "cela dépend", aucune généralité
- Réponds immédiatement par la phrase motivante avec calcul/comparaison, rien d'autre

CALCULS DE RÉFÉRENCE (à utiliser pour des comparaisons cohérentes) :
- 1 cigarette ≈ 0,01g de goudron
- CONSOMMATION PAR JOURS EN MOYENNE = 7 cigarettes/jour = 7,5€/jour
- ${days} jours = environ ${days * 7} cigarettes évitées = ${days * 7.5}€ économisés

EXEMPLES DE COMPARAISONS RÉALISTES ET COHÉRENTES :
- ${days * 7} cigarettes = ${(days * 7 / 20).toFixed(1)} paquets évités = ${days * 7.5}€ économisés
- ${days * 7.5}€ économisés = ${Math.floor((days * 7.5) / 50)} repas au restaurant OU ${Math.floor((days * 7.5) / 15)} livres OU ${Math.floor((days * 7.5) / 8)} cafés
- ${days * 7} cigarettes évitées = ${(days * 7 * 0.01).toFixed(2)}g de goudron en moins dans vos poumons
- ${(days * 7 * 0.01).toFixed(2)}g de goudron = ${Math.floor((days * 7 * 0.01) / 0.5)} cuillères à café de goudron évitées

IMPORTANT - Utilise des comparaisons LOGIQUES :
- Ne compare pas 50g de goudron à une pomme (une pomme ≈ 150g, pas 50g)
- Ne compare pas 15€ à un simple trajet en bus (un trajet coûte 2-3€, pas 15€)
- Compare intelligemment : ${days * 7.5}€ = 1-2 repas au restaurant, pas "un trajet en bus"
- Compare intelligemment : ${(days * 10 * 0.01).toFixed(2)}g de goudron = plusieurs cuillères à café, pas "une pomme"

EXEMPLES DE PHRASES CORRECTES :
- "Bravo ! ${days} jours sans fumer = ${days * 12}€ économisés, soit ${Math.floor((days * 12) / 50)} repas au restaurant que vous pouvez vous offrir !"
- "Félicitations ! ${days} jours d'arrêt, c'est ${days * 10} cigarettes évitées, soit ${(days * 10 * 0.01).toFixed(2)}g de goudron en moins dans vos poumons !"
- "Incroyable ! ${days} jours sans tabac = ${days * 12}€ économisés, soit ${Math.floor((days * 12) / 15)} livres ou ${Math.floor((days * 12) / 8)} cafés !"

CRÉATIVITÉ ENCOURAGÉE :
- Tu n'es PAS OBLIGÉ d'utiliser uniquement les exemples ci-dessus
- Tu es ENCOURAGÉ à trouver tes propres comparaisons créatives et originales
- Tu peux comparer avec des objets du quotidien, des activités, des expériences, etc.
- IMPORTANT : Respecte toujours les principes de LOGIQUE et RÉALISME (vérifie que tes comparaisons sont cohérentes)
- Exemples créatifs possibles : concerts, abonnements, vêtements, sorties, cadeaux, voyages, etc.
- Sois créatif mais RESTE RÉALISTE dans tes calculs et comparaisons

Maintenant, génère UNIQUEMENT une phrase motivante pour ${days} jours avec un calcul RÉALISTE et une comparaison COHÉRENTE (tu peux utiliser les exemples ci-dessus OU créer ta propre comparaison créative et réaliste) :`,
                    stream: false
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            return new Response(200, 'Sentence generated successfully', data);
        } catch (error) {
            if (error.code && error.message && error.data !== undefined) {
                return error;
            }
            return new Response(500, 'Failed to get model sentence: ' + error.message, null);
        }
    }
}

module.exports = { IaService };