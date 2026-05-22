from ultralytics import YOLO

if __name__ == '__main__':
    print("Loading YOLOv8 engine...")
    
    
    model = YOLO('yolov8n.pt')


    results = model.train(
        data='data.yaml',
        epochs=25,        
        imgsz=640,        
        device=0,         
        workers=8,       
        batch=32        
    )
