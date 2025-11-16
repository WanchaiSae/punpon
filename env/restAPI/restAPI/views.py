from rest_framework.decorators import api_view
from rest_framework.response import Response
import yfinance as yf

@api_view(['GET'])
def get_stock_data(request, symbol):
  """
  API Endpoint สำหรับดึงข้อมูลสรุปหุ้นจาก yfinance
  """
  try:
    ticker = yf.Ticker(symbol.upper())
    # ดึงข้อมูลที่สำคัญที่เราต้องการ
    info = ticker.info

    # 🎯 ตรวจสอบความถูกต้องของข้อมูล
    # ถ้าดึงข้อมูลสำเร็จ แต่ข้อมูลพื้นฐานมีแค่คีย์พื้นฐานมาก ๆ 
    # (เช่น 'symbol', 'maxAge') อาจหมายถึง Ticker ไม่ถูกต้อง

    if 'regularMarketPrice' not in info:
      # yfinance มักจะคืน info ที่ไม่สมบูรณ์สำหรับ Ticker ที่ผิด
      raise ValueError("Ticker ไม่ถูกต้องหรือไม่พบข้อมูลสำคัญ")
    
    # กรองเฉพาะข้อมูลที่จำเป็นเพื่อลด Payload และป้องกัน KeyError
    data = {
      'symbol': symbol.upper(),
      'longName': info.get('longName'), # แสดงชื่อหุ้น
      'regularMarketPrice': info.get('regularMarketPrice'), # แสดงราคาหุ้น
      'dividendYield': info.get('dividendYield'), # แสดงปันผลที่จ่ายต่อปี
    }



    return Response(data)

  except Exception as e:
    return Response(
      {"error": f"ไม่สามารถดึงข้อมูลสำหรับ {symbol} ได้: {str(e)}"},
      status=404
    ) 