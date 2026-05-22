from ultralytics import YOLO
import cv2
import base64

def analyze_road_damage(image_path, model_path='best.pt'):

    model = YOLO(model_path)
    results = model.predict(source=image_path, conf=0.15, iou=0.45)
    

    result = results[0]
    boxes = result.boxes
   
    

    pothole_count = len(boxes)
    total_damage_area = 0.0
    
    for box in boxes.xywhn:
        width = float(box[2])
        height = float(box[3])
        box_area = width * height 
        total_damage_area += box_area
        
    damage_percentage = total_damage_area * 100
    
    if damage_percentage > 30.0 or pothole_count >= 4:
        severity = "CRITICAL 🚨"
    elif damage_percentage > 20.0 or pothole_count >= 2:
        severity = "HIGH"
    elif damage_percentage > 10.0 or pothole_count == 1:
        severity = "MODERATE"
    else:
        severity = "NONE"



    plotted_image_array = result.plot() 
    

    success, buffer = cv2.imencode('.jpg', plotted_image_array)
    
    if not success:
        raise Exception("Could not encode image to JPEG")
        

    base64_image_string = base64.b64encode(buffer).decode('utf-8')


    return {
        "status": "success",
        "pothole_count": pothole_count,
        "damage_severity": severity,
        "processed_image_base64": base64_image_string
    }