import yfinance as yf

symbol = yf.Ticker("JEPQ")

print(symbol.info.get('dividendFrequency')) # แสดงข้อมูลทั้งหมด

# print(symbol.info.get('dividendYield')) # แสดงข้อมูลเฉพาะปันผล
# print(symbol.info.get('postMarketPrice')) # แสดงข้อมูลเฉพาะราคา