import sys
from vertexai.preview.language_models import TextGenerationModel
from google.cloud.dialogflowcx_v3.services.sessions import SessionsClient
from google.cloud.dialogflowcx_v3.types.session import TextInput, QueryInput, DetectIntentRequest
from google.cloud.dialogflowcx_v3.services.intents import IntentsClient
from google.auth import exceptions
from google.cloud import aiplatform
import google.cloud.dialogflowcx_v3 as dialogflow
import uuid
from google.cloud.dialogflowcx_v3beta1.services.agents import AgentsClient
from google.cloud.dialogflowcx_v3beta1.types import session


print("Imported modules successfully.")
try:
    aiplatform.init(project='third-nature-412206')
except exceptions.DefaultCredentialsError:
    print("Please login to your Google Cloud account.")





def detect_intent_texts(agent, session_id, texts, language_code):
    """Returns the result of detect intent with texts as inputs.

    Using the same `session_id` between requests allows continuation
    of the conversation."""
    session_path = f"{agent}/sessions/{session_id}"
    client_options = None
    agent_components = AgentsClient.parse_agent_path(agent)
    location_id = agent_components["location"]
    if location_id != "global":
        api_endpoint = f"{location_id}-dialogflow.googleapis.com:443"
        print(f"API Endpoint: {api_endpoint}\n")
        client_options = {"api_endpoint": api_endpoint}
    session_client = SessionsClient(client_options=client_options)

    for text in texts:
        text_input = TextInput(text=text)
        query_input = QueryInput(text=text_input, language_code=language_code)
        request = DetectIntentRequest(
            session=session_path, query_input=query_input
        )
        response = session_client.detect_intent(request=request)

        print(f"你的問題是: {response.query_result.text}")
        response_messages = [
            " ".join(msg.text.text) for msg in response.query_result.response_messages
        ]
        print(f"\n{' '.join(response_messages)}")
    
        action_link = None
        
        for message in response.query_result.response_messages:
            if message.payload:  # Check if payload exists
                payload_fields = dict(message.payload)  # Convert MapComposite to dict
                if "richContent" in payload_fields:
                    rich_contents = payload_fields["richContent"]
                    for content in rich_contents:
                        for item in content:
                            item_fields = dict(item)
                            if "citations" in item_fields:
                                citations = item_fields["citations"]
                                for citation in citations:
                                    citation_fields = dict(citation)
                                    if "actionLink" in citation_fields:
                                        action_link = citation_fields["actionLink"]
                                        break
                            if action_link:
                                break
                        if action_link:
                            break
                if action_link:
                    break

        print(f"來源文件: {action_link}")
    return f"{' '.join(response_messages)}"

def interview(prompt):
    # TODO(developer): Replace these values when running the function
    project_id = 'third-nature-412206'
    # For more information about regionalization see https://cloud.google.com/dialogflow/cx/docs/how/region
    location_id = 'global'
    # For more info on agents see https://cloud.google.com/dialogflow/cx/docs/concept/agent
    agent_id = 'eafba06e-a4cb-4a5b-be77-0f74048d876b'
    agent = 'projects/third-nature-412206/locations/global/agents/eafba06e-a4cb-4a5b-be77-0f74048d876b'
    # For more information on sessions see https://cloud.google.com/dialogflow/cx/docs/concept/session
    session_id = uuid.uuid4()
    
    # For more supported languages see https://cloud.google.com/dialogflow/es/docs/reference/language
    language_code ="zh-tw, en"
    texts = [prompt]
    response = detect_intent_texts(agent, session_id, texts, language_code)
    return response


prompt = sys.argv[1]
print(prompt)
interview(prompt)

