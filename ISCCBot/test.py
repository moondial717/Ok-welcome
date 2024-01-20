import sys
from vertexai.preview.language_models import TextGenerationModel
from google.auth import exceptions
from google.cloud import aiplatform

try:
    aiplatform.init(project='tsmccareerhack2024-tsid-grp6')
except exceptions.DefaultCredentialsError:
    print("Please login to your Google Cloud account.")


def interview(prompt):
    """Ideation example with a Large Language Model"""
    # TODO developer - override these parameters as needed:
    parameters = {
    "temperature": 0.2,
    "max_output_tokens": 256,
    "top_p": .8,
    "top_k": 40,
    }
    model = TextGenerationModel.from_pretrained("text-bison@001")
    response = model.predict(
    prompt,
    **parameters,
    )
    result = f"{response.text}\nTokens used: {response.grounding_metadata}"
    return result
prompt = "請使用繁體中文回答：\n"
prompt += sys.argv[1]
print(f"你的問題是: {sys.argv[1]}")
print(interview(prompt))