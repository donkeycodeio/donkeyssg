const watch = require('node-watch');
const showdown  = require('showdown')
const converter = new showdown.Converter()
const fse = require('fs-extra')
const fs = require('fs')
const must = require ('mustache');
const glob = require('glob')
const path  =require('path')
const liveServer = require("live-server");


const source_dir="./source"
const output_dir="./output"
const template_dir="./template" 

var page_menu=[]

var params = {
	root: "output", 
	open: true, 
	file: "index.html", 
};

var generateMenu = ()=>{
    page_menu=[]
    glob(source_dir+"/pages/**.md",  (err, files)=> {
        files.forEach((file)=>{

            const file_name = path.basename(file).replace('.md','');
            const out_file_name = file_name+'.html'
            
            page_menu.push({
                    title:file_name,
                    page_link:'/'+out_file_name
                });
        });
    });
}


var generatePage = (file)=>{
    
    const template = fse.readFileSync('template/index.html','UTF8');
    const menu = fse.readFileSync('template/_menu.html','UTF8');

    fse.readFile(file,'UTF8',(err,data)=>{            
        
        const file_name = path.basename(file).replace('.md','');
        var out_file_name = file_name + '.html'
        var html = converter.makeHtml(data);
        
        fs.stat(file,(err,stat)=>{

            var page_data = {
                title:file_name,
                publish_date: stat.atime,
                content:html,
                menu:page_menu
            }

            var rendered = must.render(template,page_data,{ menu:menu })

            fse.writeFile('output/'+out_file_name,rendered);            
            console.log("Generated %s", out_file_name)

        })
    });
}

const refresh = () =>{
    fse.emptyDir(output_dir, err => {
        if (err) return console.error(err)
            glob(source_dir+"/pages/**.md", (er, files)=> {
                files.forEach((file)=>{
                    generatePage(file)
                });
            })    
            console.log('success!')
      });
}

generateMenu()
refresh()

watch(source_dir, { recursive: true }, function(evt, name) {
    generateMenu()
    refresh()
});

liveServer.start(params);

