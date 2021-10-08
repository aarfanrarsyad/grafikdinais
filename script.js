
// var init
let chartLabel=[], chartData=[], slope=[],sData=data.length;
let sX=0, sY=0, sX2=0, sY2=0, sXY=0, x=0;
let tr,a,b,itemData,lastModel;
const durasi = 1000; //ms
const table = document.getElementById('table');
let tempTable = "<tr><td class='{c}'>{i}</td><td>{tgl}</td><td>{ihsg}</td></tr>";
const bulan = [[1,'Januari'],[2,'Februari'],[3,'Maret'],[4,'April'],[5,'Mei'],[6,'Juni'],[7,'Juli'],[8,'Agustus'],[9,'September'],[10,'Oktober'],[11,'November'],[12,'Desember']];
const tahun = Array(2021-1990+1).fill().map((x,i)=>i+1990);
let control = {
    sb:document.getElementById('startbulan'),
    st:document.getElementById('startTahun'),
    eb:document.getElementById('endbulan'),
    et:document.getElementById('endTahun')
}

//prepare
bulan.forEach((val)=>{
    tr = `<option value="{val}">{bln}</option>`;
    tr = tr.replace('{val}',val[0]).replace('{bln}',val[1])
    control.sb.insertAdjacentHTML( 'beforeend', tr )
    control.eb.insertAdjacentHTML( 'beforeend', tr )
    document.getElementById('mbulan').insertAdjacentHTML( 'beforeend', tr )
})
tahun.forEach((val)=>{
    tr = `<option>{th}</option>`;
    document.getElementById('mTahun').insertAdjacentHTML( 'beforeend', tr.replace('{th}',val+32) )
    tr = tr.replace('{th}',val)
    control.st.insertAdjacentHTML( 'beforeend', tr )
    control.et.insertAdjacentHTML( 'beforeend', tr )
})
document.getElementById('endbulan').value = 12;
document.getElementById('endTahun').value = 2021;

// chart init
var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: chartLabel,
        datasets: [{
            label: 'IHSG',
            data: chartData,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            // borderColor: 'rgba(129, 201, 149, 1)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            tension:0.5,
            pointRadius:0,
        },{
            label: 'Trendline',
            data: slope,
            borderColor: 'rgba(99, 135, 255, 1)',
            borderWidth: 1,
            tension:0.5,
            pointRadius:0,
        }]
    },
    options: {
        animation: {
            duration: 100,
        }
    },
});

//all method
(function() {
    function draw(time,tableinit=true) { let i=0; x=0;
        [].forEach.call(document.getElementsByClassName("xdata"), function(el) {el.innerHTML = '';});
        while (data[i].tgl < time.dari) i++;
        let interval = setInterval(function(){
            if(!Boolean(data[i])){
                // console.log([[i],data[i]])
                trendline(lastModel,itemData.x+1)
                clearInterval(interval);i++;
            } else if(data[i].tgl < time.sampai){
                itemData = {
                    x:x++,
                    y:data[i].close,
                    x2:Math.pow(x,2),
                    y2:Math.pow(data[i].close,2),
                    xy:(x)*data[i].close,
                    tgl:data[i].tgl
                };
                sX+=itemData.x; sY+=itemData.y; sX2+=itemData.x2; sY2+=itemData.y2; sXY+=itemData.xy;
                
                chartLabel.push(data[i].date)
                chartData.push(data[i].close)
                
                myChart.data.datasets[0].data = chartData;
                myChart.data.labels = chartLabel;
                if(i>(durasi*60/sData)) myChart.update();

                lastModel = model(itemData.x+1,sX,sY,sX2);
                if(lastModel.fb>0){tr = "Model: Y="+lastModel.fa+'+'+lastModel.fb+"X";} 
                else {tr = 'Model: Y='+lastModel.fa+lastModel.fb+'X';}
                if(i%100==0 || i==4) document.querySelector('#model').innerHTML = tr;
                if (tableinit) {
                    tr = tempTable.replace('{c}','xdata c-'+data[i].tgl).replace('{i}',x);
                    tr = tr.replace('{tgl}',data[i].date).replace('{ihsg}',data[i].close)
                    table.insertAdjacentHTML( 'beforeend', tr )
                } else {
                    tr = document.getElementsByClassName('c-'+data[i].tgl)
                    if(Boolean(data[i]) && Boolean(tr[0])) tr[0].innerHTML = x
                }
                i++;
            } else {
                // console.log([i,data[i]])
                trendline(lastModel,itemData.x+1)
                clearInterval(interval);
                i++
            }
        },durasi/sData);
    }
    
    if (true) {
        draw({dari:data[0].tgl,sampai:data[sData-1].tgl})
    } else {
        draw({dari:1523232000,sampai:1633599811})
    }

    function trendline(model,n) {
        // console.log({model,n,itemData})
        myChart.data.datasets[1].data = []
        slope=[]
        if(model.fb>0){tr = "Model: \\(Y="+model.fa+'+'+model.fb+"X\\)";} 
        else {tr = "Model: \\(Y="+model.fa+model.fb+"X\\)";}
        document.querySelector('#model').innerHTML = tr;
        MathJax.Hub.Queue(["Typeset",MathJax.Hub])

        for (let i = 0; i < n; i++) {
            tr = model.b*(i)+model.a;
            if(tr<0) tr=null;
            slope.push(tr);
            setTimeout(() => {
                myChart.data.datasets[1].data = slope;
                myChart.update();
            }, 100);
        }
    }

    function model(n,sX,sY,sX2) {
        b = (n * sXY) - (sX * sY);
        b = Number((b / ((n * sX2) - (Math.pow(sX, 2)))));
        a = sY - (b * sX);
        a = Number((a/n));

        return Object({a,b,fa:a.toFixed(2),fb:b.toFixed(2)})
    }

    document.getElementById('run').addEventListener('click',()=>{
        let getTime = (m,y)=>{return new Date(y+'/'+m+'/1').getTime()/1000}
        let time = {
            dari:getTime(control.sb.value,control.st.value),
            sampai:getTime(control.eb.value,control.et.value),
        }

        if (time.dari>time.sampai) time = {dari:time.sampai,sampai:time.dari}
        useData=[]; chartData=[]; chartLabel=[]; slope=[];
        myChart.data.labels = chartLabel;
        myChart.data.datasets[0].data = chartData;
        myChart.data.datasets[1].data = slope;
        myChart.update();
        sX=0; sY=0; sX2=0; sY2=0; sXY=0;
        draw(time,false)
    })

    document.getElementById('predict').addEventListener('click',()=>{
        let Xmodel = document.getElementById('mTahun').value+'/';
        Xmodel += document.getElementById('mbulan').value+'/1';
        Xmodel = new Date(Xmodel).getTime()/1000 - itemData.tgl;
        Xmodel = Math.ceil(Xmodel/7/24/60/60) + itemData.x;

        tr = lastModel.b*(Xmodel)+lastModel.a;
        if(lastModel.fb>0){
            tr = "Prediksi: \\("+lastModel.fa+'+'+lastModel.fb+"("+Xmodel+")="+tr.toFixed(2)+"\\)";
        } else {
            tr = "Prediksi: \\("+lastModel.fa+lastModel.fb+"("+Xmodel+")="+tr.toFixed(2)+"\\)";
        }
        document.querySelector('#model').innerHTML = tr;
        MathJax.Hub.Queue(["Typeset",MathJax.Hub])
    })

})();
    