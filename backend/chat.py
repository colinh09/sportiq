from openai import AzureOpenAI
from dotenv import load_dotenv
import os
import re
import json
load_dotenv()

print("Loading chat.py...")
client = AzureOpenAI(
    api_key = os.getenv("AZURE_OPENAI_API_KEY"),  
    api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
    azure_endpoint= os.getenv("AZURE_OPENAI_ENDPOINT")
)
    

f1 = open("bitsize.txt", "a")
f2 = open("flashcards.txt", "a")



def take_user_feedback(bitsize_file): #do this every so often to finetune the response to help the user learn better
    feedback_options = {
        '1': 'Too Fast',
        '2': 'Just Right',
        '3': 'Too Slow'
    }
    
    print("\nHow is the pace of learning?")
    for key, value in feedback_options.items():
        print(f"{key}: {value}")
    
    user_choice = input("Enter your choice (1-3): ") #button click...
    
    
    if user_choice in feedback_options:
        with open(f"{bitsize_file}_config.txt", "w") as config:
            if user_choice == '1':  # fast
                config.write("detailed=true\nexamples=more\npace=slow")
                return {
                    "detailed": True,
                    "examples": "more",
                    "pace": "slow"
                }
            elif user_choice == '2':  # just right
                config.write("detailed=balanced\nexamples=balanced\npace=medium")
                return {
                    "detailed": "balanced",
                    "examples": "balanced",
                    "pace": "medium"
                }
            else:  # slow
                config.write("detailed=false\nexamples=less\npace=fast")
                return {
                    "detailed": False,
                    "examples": "less",
                    "pace": "fast"
                }
    return None 
    

def bitsize_learn(bitsize): #make this the server, for now is a txt. name of the file

    config = {}
    try:
        with open(f"{bitsize}_config.txt", "r") as config_file:
            for line in config_file:
                key, value = line.strip().split('=')
                config[key] = value
    except FileNotFoundError:
        config = {"detailed": "balanced", "examples": "balanced", "pace": "medium"}


    system_prompt = f"You are an expert robotic assistant on all topics related to MLB. Adjust your teaching style to be {'more detailed' if config['detailed'] == 'true' else 'less detailed'}. Provide {'more' if config['examples'] == 'more' else 'fewer'} examples. Keep explanations {'comprehensive' if config['pace'] == 'slow' else 'concise' if config['pace'] == 'fast' else 'balanced'}."

    conversation = [{"role": "system", "content": system_prompt}]

    f1 = open(f"{bitsize}.txt", "+a")
    prev_content = f1.read()

    if prev_content: #checking if file is empty
        conversation.append({"role": "user", "content": prev_content + "\n\n Using what is above, tell me about the next logical thing about MLB in a bitsize learning module. Name and number this module"})
    else:
        conversation.append({"role": "user", "content": "In a bitsize module about MLB, tell me information about the first subject a person should learn, while trying to understand MLB. Name this module"})

    # Get response from Azure OpenAI
    response = client.chat.completions.create(
        model=os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT"),
        messages=conversation,
        temperature=0.7,
        max_tokens=1000
    )
    
    
    reply = response.choices[0].message.content
    
    module_name = re.search(r'(?i)module\s*name\s*:\s*(.*)', reply)
    module_name = module_name.group(1).strip() if module_name else None
    
    print(reply)
    
    f1.write(reply) #bold lesson number on the REACT application
    f1.write('\n' * 5)
    f1.close()

    #next, make flashcards out of covered subjects.
    return module_name, reply



#Require flashcard creation on general case, plan to do this later. Must test current functions one by one
def create_flashcards_from_ai_output(bitsize_learn_response):
    parsed_flashcards = []
    #add flashcards to a json file.
    module_name = bitsize_learn_response[0]
    ai_response = bitsize_learn_response[1]
    system_prompt = f"Create flashcards for the key baseball concepts discussed inside the prompt. Seperate each flashcard into 'Concept' and 'Definition' in the output. Make as many that seem fit, that provide unique concepts for key baseball concepts and teams. Make sure the definition is always one sentence long"

    conversation = [{"role": "system", "content": system_prompt}]

    conversation.append({"role": "user", "content": ai_response})
                        
    response = client.chat.completions.create(
        model=os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT"),
        messages=conversation,
        temperature=0.7,
        max_tokens=1000
    )
    reply = (response.choices[0].message.content)
    reply = reply.replace('*', "")
    
    flashcards = reply.split("Flashcard")
    
    
    print(flashcards)
    for flashcard in flashcards:
        startIdx = flashcard.find('Concept')
        
        print(flashcard)
        if startIdx != -1:
            startIdx += len('Concept: ')
            defIdx = flashcard.index(' \nDefinition')
            concept = flashcard[startIdx:defIdx - 1]
            defIdx += len(' \nDefinition: ')
            definition = flashcard[defIdx:flashcard.find('.')]
            parsed = {'Topic': module_name, 'Concept': concept, 'Definition': definition, 'Learn Status': 0} #learn status 0 = don't know, 1 = learning, 2 = know
            parsed_flashcards.append(parsed)

    json_file_path = 'flashcards.json'
    try:
        with open(json_file_path, 'r') as file:
            existing_flashcards = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        existing_flashcards = []

    existing_flashcards.extend(parsed_flashcards)
    with open(json_file_path, 'w') as file:
        json.dump(existing_flashcards, file, indent=4)
    return parsed_flashcards
    
    


def typical_chat_loop(team_name = None): #allow the user to ask questions about general MLB or a specific team, save these conversations, and give them the option for deletion
    
    if team_name:
        filename = f"conversation_{team_name.lower().replace(' ', '_')}.json" #file to save conversation
        system_prompt = system_message = f"You are an expert robotic assistant focused on the {team_name}. You will help provide detailed information about this MLB team's history, players, statistics, and culture. You will also explain specific terms and lingo used by {team_name} fans and sports casters."
    else:
        filename = "general_conversation.json"
        system_prompt = "You are an expert robotic assistant on all topics related to MLB. You will help provide learning information to a user that wants to learn more about baseball and specific teams. Also, you will help define specific terms and lingo used in MLB by fans and sports casters alike."

    conversation = [{"role": "system", "content": system_prompt}]



    #check for saved convo
    if os.path.exists(filename):
        with open(filename, "r") as file:
            conversation = json.load(file)
    else:
        conversation = [{"role": "system", "content": system_message}]

    while True:
        user_input = input("You: ")
        
        # commands for quitting out for the user (write these as instuctions or button clicks)
        if user_input.lower() in 'exit':
            #save before quitting
            with open(filename, "w") as file:
                json.dump(conversation, file)
            print(f"Conversation saved for {'team ' + team_name if team_name else 'general MLB topics'}. Goodbye!")
            break
            
        if user_input.lower() == 'delete': #can delete convo, use button press
            if os.path.exists(filename):
                os.remove(filename)
                print(f"Conversation history deleted for {'team ' + team_name if team_name else 'general MLB topics'}.")
                conversation = [{"role": "system", "content": system_message}]
            continue

        # rest of normal conversation
        conversation.append({"role": "user", "content": user_input})
        
        response = client.chat.completions.create(
            model=os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT"),
            messages=conversation,
            temperature=0.7,
            max_tokens=1000
        )
        
        assistant_reply = response.choices[0].message.content
        conversation.append({"role": "assistant", "content": assistant_reply})
        
        print("\nAssistant:", assistant_reply, "\n") #send these to the server


bitsize_learn('bitsize')