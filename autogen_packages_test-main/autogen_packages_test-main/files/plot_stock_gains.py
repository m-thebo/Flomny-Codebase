# filename: plot_stock_gains.py
import yfinance as yf
import matplotlib.pyplot as plt

# Download historical data for TSLA and META
tsla = yf.download("TSLA", start="2024-01-01", end="2024-10-20")
meta = yf.download("META", start="2024-01-01", end="2024-10-20")

# Calculate YTD gains
tsla_gain = (tsla["Adj Close"].iloc[-1] - tsla["Adj Close"].iloc[0]) / tsla["Adj Close"].iloc[0] * 100
meta_gain = (meta["Adj Close"].iloc[-1] - meta["Adj Close"].iloc[0]) / meta["Adj Close"].iloc[0] * 100

# Plot the gains
plt.figure(figsize=(10, 6))
plt.bar(["TSLA", "META"], [tsla_gain, meta_gain])
plt.title("YTD Stock Price Gains")
plt.ylabel("Gain (%)")
plt.savefig("stock_gains.png")
plt.show()