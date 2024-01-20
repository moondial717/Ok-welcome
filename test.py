import pprint
import google.generativeai as palm

palm.configure(api_key='AIzaSyCU0KSzEVNRU29Gh2BSNj2gzFqrk9XmD6M')

models = [m for m in palm.list_models() if 'generateText' in m.supported_generation_methods]
model = models[0].name
print(model)

prompt = "Who are you?"

completion = palm.generate_text(
    model=model,
    prompt=prompt,
    temperature=0,
    # The maximum length of the response
    max_output_tokens=800,
)
print(completion.result)