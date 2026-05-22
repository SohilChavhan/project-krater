import pandas as pd
import numpy as np
import pickle
from keras.models import Sequential
from keras.layers import Dense
from sklearn.model_selection import train_test_split

print("1. Loading Data...")
df = pd.read_excel('ml_budget_estimator/data/pmgsy_road_data.xlsx', skiprows=10)


df['District Name'] = df['District Name'].astype(str).str.strip()


df = df[['District Name', 'Road Length (Kms)', 'Sanction Cost( in Lakhs)']].dropna()

print("2. Engineering Features (Calculating Cost Per Meter)...")
df['Cost_Per_Meter'] = (df['Sanction Cost( in Lakhs)'] * 100000) / (df['Road Length (Kms)'] * 1000)
df = df[(df['Cost_Per_Meter'] > 0) & (df['Cost_Per_Meter'] != np.inf)]

print("3. Preparing Neural Network Inputs...")
X = pd.get_dummies(df['District Name']).astype(float)
y = df['Cost_Per_Meter'].values


district_columns = X.columns.tolist()
with open('district_columns.pkl', 'wb') as f:
    pickle.dump(district_columns, f)


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("4. Building Keras Regression Model...")
model = Sequential([
    Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
    Dense(32, activation='relu'),
    Dense(1, activation='linear') 
])

model.compile(optimizer='adam', loss='mae')
model.fit(X_train, y_train, epochs=20, validation_data=(X_test, y_test), batch_size=32)

model.save('budget_estimator.keras')
print("Model saved to budget_estimator.keras!")
print("Columns saved to district_columns.pkl! 🚀")