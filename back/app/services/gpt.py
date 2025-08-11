import os
from openai import OpenAI
from dotenv import load_dotenv
from openai import RateLimitError, OpenAIError

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def ask_gpt(prompt: str) -> str:
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Tu es un assistant utile et précis."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        return response.choices[0].message.content

    except RateLimitError:
        # Erreur de quota dépassé (429)
        raise Exception("Quota API OpenAI dépassé. Veuillez vérifier votre plan et facturation.")

    except OpenAIError as e:
        # Autres erreurs OpenAI
        raise Exception(f"Erreur OpenAI : {e}")

    except Exception as e:
        # Erreurs génériques
        raise Exception(f"Erreur inattendue : {e}")
