import cv2
import numpy as np
import json
import urllib
from PIL import Image, ImageDraw, ImageFont
from paddleocr import PaddleOCR
ocr = PaddleOCR(use_angle_cls=True)

client_id = "4fl7e4k1ql"
client_secret = "ErTuX9qqfCIt1KyqHqZYeSgI4x8lqYhEAvfJ6sAt"

def midpoint(x1, y1, x2, y2):
    x_mid = int((x1 + x2)/2)
    y_mid = int((y1 + y2)/2)
    return (x_mid, y_mid)

def _get_text_mask(box, mask):
  width = box['img_width']   # OCR 로 인식된 문자를 감싸는 Bounding Box의 너비(좌우길이)
  height = box['img_height'] # OCR 로 인식된 문자를 감싸는 Bounding Box의 높이(상하길이)
  padding_x = int((width*5)/100)   # 좌우 방향 padding 은  Bounding Box 너비의 20분의 1 만큼 줌. (숫자 바꿔도 됨). 나누는 숫자가 작을수록 인식된 box의 너비 + padding값이 커짐
  padding_y = int((height*20)/100)  # 상하 방향 padding 은  Bounding Box 높이의 15분의 1 만큼 줌. (숫자 바꿔도 됨). 나누는 숫자가 작을수록 인식된 box의 높이 + padding값이 커짐
  cv2.rectangle(mask, (box['top_left'][0] - padding_x, box['top_left'][1] - padding_y), (box['bottom_right'][0] + padding_x, box['bottom_right'][1] + padding_y), (255, 255, 255), -1)
#   cv2.rectangle(mask, (box['top_left'][0] - padding_x, box['top_left'][1] - padding_y), (box['bottom_right'][0] + padding_x, box['bottom_right'][1] + padding_y), (255, 0, 0), 2)
  return mask

def get_color(top, left, bottom, right, image):
  image_roi = Image.fromarray(image[top:bottom, left:right])
  # image_roi.save("abc.jpg")
  colors = sorted(image_roi.getcolors(image_roi.size[0]*image_roi.size[1]))
  c1 = colors[-1][-1]
  c2 = colors[0][-1]
  r_lower, g_lower, b_lower = c2[0], c2[1], c2[2]
  r_upper, g_upper, b_upper = c1[0], c1[1], c1[2]
  (b, g, r) = cv2.split(np.asarray(image_roi))
  ret2, thresh2 = cv2.threshold(b, b_upper-b_lower, 255, cv2.THRESH_BINARY)
  ret3, thresh3 = cv2.threshold(g, g_upper-g_lower, 255, cv2.THRESH_BINARY)
  ret4, thresh4 = cv2.threshold(r, r_upper-r_lower, 255, cv2.THRESH_BINARY)
  bgr_thresh = cv2.merge((thresh2, thresh3, thresh4))
  out_img = Image.fromarray(bgr_thresh)
  colors = sorted(out_img.getcolors(out_img.size[0]*out_img.size[1]))
  print('colors', colors)
  return colors[-2][-1]

def get_mask(image, boxes):
  mask = np.zeros(image.shape[:2], dtype="uint8")
  for box in boxes:
    mask = _get_text_mask(box, mask)
  return mask

def find_font_size(text, font, image, target_width_ratio):
    tested_font_size = 100
    tested_font = ImageFont.truetype(font, tested_font_size)
    observed_width, observed_height = get_text_size(text, image, tested_font)
    estimated_font_size = tested_font_size / (observed_width / image.width) * target_width_ratio
    return round(estimated_font_size)

def get_text_size(text, image, font):
    im = Image.new('RGB', (image.width, image.height))
    draw = ImageDraw.Draw(im)
    return draw.textsize(text, font)

def get_font_size(img_width, img_height, text):
  img = Image.new('RGB', (img_width, img_height), (255, 255, 255))
  font_size = find_font_size(text, "test.ttf", img, 0.8)
  return font_size

def draw_text(item,image):
  img = Image.new('RGB', (item['img_width'], item['img_height']), (255, 255, 255))
  if image.shape[-1] == 4:
    img = Image.new('RGBA', (item['img_width'], item['img_height']), (255, 255, 255, 255))
  font_size = find_font_size(item["text"], "test.ttf", img, 0.8)
  image = Image.fromarray(image)
  draw = ImageDraw.Draw(image)
  font = ImageFont.truetype("test.ttf", font_size)
  draw.text((item["top_left"][0], item["top_left"][1]),item["text"], item['color'], font=font)
  return np.asarray(image)


def detect_lang(text):
  data = "query=" + text
  url = "https://naveropenapi.apigw.ntruss.com/langs/v1/dect"
  
  proxy = urllib.request.ProxyHandler({'https': r'http://14a6bcbf08595:82a07ac06c@115.167.16.60:12323'})
  auth = urllib.request.HTTPBasicAuthHandler()
  opener = urllib.request.build_opener(proxy, auth, urllib.request.HTTPHandler)
  urllib.request.install_opener(opener)
  
  request = urllib.request.Request(url)
  request.add_header("X-NCP-APIGW-API-KEY-ID",client_id)
  request.add_header("X-NCP-APIGW-API-KEY",client_secret)
  response = urllib.request.urlopen(request, data=data.encode("utf-8"))
  rescode = response.getcode()
  if(rescode==200):
      response_body = response.read()
      res = json.loads(response_body.decode('utf-8'))['langCode']
      return res

def translate(encText):
    encText1 = urllib.parse.quote(encText)
    # encText = urllib.parse.quote("Enter a sentence to translate")
    source = detect_lang(encText1)
    data = f"source={source}&target=en&text={encText1}"
    url = "https://naveropenapi.apigw.ntruss.com/nmt/v1/translation"
    
    proxy = urllib.request.ProxyHandler({'https': r'http://14a6bcbf08595:82a07ac06c@115.167.16.60:12323'})
    auth = urllib.request.HTTPBasicAuthHandler()
    opener = urllib.request.build_opener(proxy, auth, urllib.request.HTTPHandler)
    urllib.request.install_opener(opener)
    
    request = urllib.request.Request(url)
    request.add_header("X-NCP-APIGW-API-KEY-ID",client_id)
    request.add_header("X-NCP-APIGW-API-KEY",client_secret)
    try:
        response = urllib.request.urlopen(request, data=data.encode("utf-8"))
    except:
        return encText
    rescode = response.getcode()
    if(rescode==200):
        response_body = response.read()
        return json.loads(response_body.decode('utf-8'))['message']['result']['translatedText']
    else:
        print("Error Code:" + rescode)
        return encText

def read_text(image: np.ndarray):
    result = ocr.ocr(image, cls=False)
    detailed = list()
    bboxes = list()
    for detection in result: 
        bboxes.append(detection[0])
        top_left = tuple([int(val) for val in detection[0][0]])
        bottom_right = tuple([int(val) for val in detection[0][2]])
        text = detection[1][0]
        img_width = bottom_right[0] - top_left[0]
        img_height = bottom_right[1] - top_left[1]
        print('bottom right', bottom_right)
        print('text', text)
        print('img width', img_width)
        print('img height', img_height)
        if not(img_width>0 and img_height>0):
            continue
        new_dict = {
            "top_left": top_left,
            "bottom_right": bottom_right,
            "x": top_left[0],
            "y": top_left[1]/2,
            'font_size': int(get_font_size(img_width, img_height, text)/2),
            "img_width": img_width,
            "img_height": img_height,
            # "text": ts.translate_text(text, translator='google', to_language='ko')
            # 'text': PapagoTranslator(client_id = '4fl7e4k1ql', secret_key='ErTuX9qqfCIt1KyqHqZYeSgI4x8lqYhEAvfJ6sAt',source='ja', target='ko').translate(text)
            'text': translate(text),
            'color': get_color(top_left[1], top_left[0], bottom_right[1], bottom_right[0], image)
            # 'text': text
        }
        detailed.append(new_dict)
    
    return detailed, bboxes
