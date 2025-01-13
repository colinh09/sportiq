from datetime import date, datetime

def update_learning_streak():
    try:
        with open("learningstreak.txt", "r") as f:
            lines = f.readlines()
            current_streak = int(lines[0].strip()) if lines else 0
            last_date = datetime.strptime(lines[1].strip(), "%Y-%m-%d").date() if len(lines) > 1 else None
    except FileNotFoundError:
        
        current_streak = 0
        last_date = None
    
    today = date.today()
    if last_date is None:
        
        new_streak = 1
    elif last_date == today:
        
        return current_streak
    elif (today - last_date).days == 1:
        
        new_streak = current_streak + 1
    else:
        new_streak = 1
    with open("learningstreak.txt", "w") as f:
        f.write(f"{new_streak}\n{today}")
    
    return new_streak

