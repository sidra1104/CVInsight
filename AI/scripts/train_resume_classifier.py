import pandas as pd
import re
from sklearn.model_selection import train_test_split
from nltk.tokenize import TreebankWordTokenizer
from nltk.corpus import stopwords
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib  # for saving model

nltk.download('punkt')
nltk.download('stopwords')


# Load the dataset
df = pd.read_csv('C:/Users/sidra/OneDrive/Desktop/ResumeAnalyzer/AI/data/resume/UpdatedResumeDataSet.csv')  # <-- Adjust path if needed

# Basic cleaning function
def clean_text(text):
    text = re.sub(r'\n+', ' ', text)
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\d+', '', text)
    tokenizer = TreebankWordTokenizer()
    tokens = tokenizer.tokenize(text.lower())
    tokens = [word for word in tokens if word not in stopwords.words('english')]
    return ' '.join(tokens)


df['cleaned_resume'] = df['Resume'].apply(clean_text)
# Show first few cleaned samples

X_train, X_test, y_train, y_test = train_test_split(
    df['cleaned_resume'], df['Category'], test_size=0.2, random_state=42
)

model = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=5000)),
    ('clf', LogisticRegression(max_iter=1000))
])

model.fit(X_train, y_train)

# 4. Evaluate
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))

# 5. Save the model
joblib.dump(model, 'C:/Users/sidra/OneDrive/Desktop/ResumeAnalyzer/AI/models/resume_classifier.pkl')
print("✅ Model saved to ai/models/resume_classifier.pkl")
