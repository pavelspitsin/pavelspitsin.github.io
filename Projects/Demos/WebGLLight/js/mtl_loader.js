

class MtlLoader {

    loadMaterials(mtlib, model, callback_loaded) {

        this.loadMtlFile(mtlib, (fileContet) => {

            let materials = this.parseFile(fileContet);
            model.materials = materials;

            callback_loaded();
        });
    }


    loadMtlFile(mtlib, callback_Loaded) {
        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status !== 404) {
                callback_Loaded(xhr.responseText);
            }
          }
          
        xhr.open('GET', './resources/Models/' + mtlib, true);
        xhr.send();
    }


    parseFile(fileContet) {

        let materials = {};
        let currentMaterial = null;


        let lines = fileContet.split('\n');

        for(let i = 0; i < lines.length; ++i) {

            let line = lines[i].trim();
            let words = line.split(' ');
            let firstWord = words[0];

            
            switch(firstWord) {

                case 'newmtl':
                {
                    let materialName = words[1];

                    currentMaterial = new Material();
                    currentMaterial.name = materialName;

                    materials[materialName] = currentMaterial;
                    break;
                }     

                case 'Ns':
                {
                    if (words.length != 2) {                      
                        console.log(`WARNING. Incorrect '${firstWord}' value in ${i} line.`);
                        break;
                    }

                    currentMaterial.specularExponent = this.transformSpecularExponent(parseFloat(words[1]));
                    break;
                }  

                case 'Ka':
                {
                    let value = words.slice(1, words.length);

                    if (value.length != 3) {                        
                        console.log(`WARNING. Incorrect '${firstWord}' value in ${i} line.`);
                        break;
                    }
                    
                    currentMaterial.ambientColor = vec3.clone(value);
                    break;
                }

                case 'Kd':                   
                {
                    let value = words.slice(1, words.length);

                    if (value.length != 3) {                        
                        console.log(`WARNING. Incorrect '${firstWord}' value in ${i} line.`);
                        break;
                    }

                    currentMaterial.diffuseColor = vec3.clone(value);
                    break;
                }

                case 'Ks':                   
                {
                    let value = words.slice(1, words.length);

                    if (value.length != 3) {                        
                        console.log(`WARNING. Incorrect '${firstWord}' value in ${i} line.`);
                        break;
                    }

                    currentMaterial.specularColor = vec3.clone(value);
                    break;
                }

                case 'd':                   
                {
                    if (words.length != 2) {                      
                        console.log(`WARNING. Incorrect '${firstWord}' value in ${i} line.`);
                        break;
                    }

                    currentMaterial.alpha = parseFloat(words[1]);
                    break;
                }


                case 'map_Bump':
                {
                    if (words.length != 2) {                        
                        console.log(`WARNING. Incorrect '${firstWord}' value in ${i} line.`);
                        break;
                    }                    
                    currentMaterial.normalMap = words[1];
                    break;
                }


                case 'map_Kd':
                {
                    if (words.length != 2) {                        
                        console.log(`WARNING. Incorrect '${firstWord}' value in ${i} line.`);
                        break;
                    }                    
                    currentMaterial.diffuseMap = words[1];
                    break;  
                }


                default:
                    break;

            }

        }

        return materials;
    }


    transformSpecularExponent(exponent) {
        return exponent / 1000.0 * 128.0;
    }
    
    //getMaterialNames(model) {
    //
    //    let materials = [];
    //
    //    model.meshes.map((mesh) => {
    //        if (materials.indexOf(mesh.materialName) == -1) {
    //            materials.push(mesh.materialName);
    //        }
    //    });
    //
    //    return materials;
    //}

}