PS E:\MyPythonAPPS\scis-group-last-version> New-Item -ItemType Directory -Path routes, models, static, templates, config, extensions


    Directory: 
    E:\MyPythonAPPS\scis-group-last-version


Mode                 LastWriteTime         Length Na
                                                  me
----                 -------------         ------ --
d-----         5/23/2025   8:31 AM                ro
                                                  ut 
                                                  es 
d-----         5/23/2025   8:31 AM                mo 
                                                  de 
                                                  ls 
d-----         5/23/2025   8:31 AM                st 
                mp
                                                  la
                                                  te
                mp
                                                  la
                                                  te
                mp
                                                  la
                                                  te
                                                  s
d-----         5/23/2025   8:31 AM                co
                                                  nf
                                                  ig
d-----         5/23/2025   8:31 AM                ex
                                                  te
                                                  ns
                                                  io
                                                  ns


PS E:\MyPythonAPPS\scis-group-last-version> cd config
PS E:\MyPythonAPPS\scis-group-last-version\config> New-Item -ItemType File -Path config.py                                  
               

    Directory: E:\MyPythonAPPS\scis-group-last-version\config


Mode                 LastWriteTime         Length Name       
----                 -------------         ------ ----       
-a----         5/23/2025   8:33 AM              0 config.py  


PS E:\MyPythonAPPS\scis-group-last-version\config> cd ../extensions
PS E:\MyPythonAPPS\scis-group-last-version\extensions> New-Item -ItemType File -Path extensions.py


    Directory:
    E:\MyPythonAPPS\scis-group-last-version\extensions        


Mode                 LastWriteTime         Length Name        
----                 -------------         ------ ----        
-a----         5/23/2025   8:34 AM              0 extensions. 
                                                  py


PS E:\MyPythonAPPS\scis-group-last-version\extensions> cd ../models    
PS E:\MyPythonAPPS\scis-group-last-version\models> New-Item -ItemType File -Path models.py    



    Directory: E:\MyPythonAPPS\scis-group-last-version\models


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         5/23/2025   8:34 AM              0 models.py


PS E:\MyPythonAPPS\scis-group-last-version\models> cd ../routes
PS E:\MyPythonAPPS\scis-group-last-version\routes> New-Item -ItemType File -Path employees.py,books.py,messages.py


    Directory: E:\MyPythonAPPS\scis-group-last-version\routes


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         5/23/2025   8:35 AM              0 employees.p
                                                  y
-a----         5/23/2025   8:35 AM              0 books.py
-a----         5/23/2025   8:35 AM              0 messages.py

                                                   cd ../static
PS E:\MyPythonAPPS\scis-group-last-version\static> New-Item -ItemType Directory -Path images,icons,assets,documents,lib,message,tones


    Directory: E:\MyPythonAPPS\scis-group-last-version\static


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         5/23/2025   8:38 AM                images
d-----         5/23/2025   8:38 AM                icons
d-----         5/23/2025   8:38 AM                assets
d-----         5/23/2025   8:38 AM                documents
d-----         5/23/2025   8:38 AM                lib
d-----         5/23/2025   8:38 AM                message
d-----         5/23/2025   8:38 AM                tones


PS E:\MyPythonAPPS\scis-group-last-version\static> New-Item -ItemType Directory -Path js                                             


    Directory: E:\MyPythonAPPS\scis-group-last-version\static


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         5/23/2025   8:38 AM                js


PS E:\MyPythonAPPS\scis-group-last-version\static> cd 
PS E:\MyPythonAPPS\scis-group-last-version\static> cd
PS E:\MyPythonAPPS\scis-group-last-version\static> cd ..
PS E:\MyPythonAPPS\scis-group-last-version> New-Item -ItemType File -Path app.py 


    Directory: E:\MyPythonAPPS\scis-group-last-version


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         5/23/2025   8:39 AM              0 app.py


PS E:\MyPythonAPPS\scis-group-last-version> New-Item -ItemType File -Path vercel.json


    Directory: E:\MyPythonAPPS\scis-group-last-version


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         5/23/2025   8:39 AM              0 vercel.json


PS E:\MyPythonAPPS\scis-group-last-version>  New-Item -ItemType File -Path .env       


    Directory: E:\MyPythonAPPS\scis-group-last-version


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         5/23/2025   8:39 AM              0 .env


PS E:\MyPythonAPPS\scis-group-last-version> cd templates
PS E:\MyPythonAPPS\scis-group-last-version\templates> New-Item -ItemType File -Path index.html


    Directory: E:\MyPythonAPPS\scis-group-last-version\templates


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         5/23/2025   8:40 AM              0 index.html


PS E:\MyPythonAPPS\scis-group-last-version\templates> 
PS E:\MyPythonAPPS\scis-group-last-version> python -m venv venv   
PS E:\MyPythonAPPS\scis-group-last-version>  venv\Scripts\activate        
(venv) PS E:\MyPythonAPPS\scis-group-last-version> pip freeze > requirements.txt         
(venv) PS E:\MyPythonAPPS\scis-group-last-version> pip install -r requirements.txt
(venv) PS E:\MyPythonAPPS\scis-group-last-version> pip install --upgrade eventlet gevent 